// /src/app/api/admin/nin-lookup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { protectData } from "@/lib/security/dataProtection";
import { z } from "zod";

// Enhanced Zod schema for input validation
const NINLookupSchema = z.object({
  nin: z
    .string()
    .trim()
    .min(10, "NIN must be at least 10 characters")
    .max(20, "NIN must not exceed 20 characters")
    .regex(/^[A-Za-z0-9]+$/, "NIN must contain only alphanumeric characters"),
});

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: 15, // Reduced from 20 for better security
  WINDOW_MS: 60 * 1000, // 1 minute
  STRICT_WINDOW_MS: 5 * 60 * 1000, // 5 minutes for strict limiting
  MAX_STRICT_REQUESTS: 50, // Maximum requests in 5 minutes
};

// Rate limiting store with TTL cleanup
const rateLimitMap = new Map<
  string,
  {
    count: number;
    resetTime: number;
    strictCount: number;
    strictResetTime: number;
  }
>();

// Enhanced audit log actions
const AUDIT_ACTIONS = {
  NIN_LOOKUP_ATTEMPT: "NIN_LOOKUP_ATTEMPT",
  NIN_LOOKUP_SUCCESS: "NIN_LOOKUP_SUCCESS",
  NIN_LOOKUP_FAILED: "NIN_LOOKUP_FAILED",
  NIN_LOOKUP_VALIDATION_ERROR: "NIN_LOOKUP_VALIDATION_ERROR",
  NIN_LOOKUP_RATE_LIMITED: "NIN_LOOKUP_RATE_LIMITED",
  NIN_LOOKUP_DATA_PROTECTION_ERROR: "NIN_LOOKUP_DATA_PROTECTION_ERROR",
  SECURITY_ALERT: "SECURITY_ALERT",
} as const;

// Enhanced rate limiting with dual windows
function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  strictViolation: boolean;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_MS;
  const strictWindowStart = now - RATE_LIMIT_CONFIG.STRICT_WINDOW_MS;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (
      value.resetTime < windowStart &&
      value.strictResetTime < strictWindowStart
    ) {
      rateLimitMap.delete(key);
    }
  }

  const clientData = rateLimitMap.get(ip) || {
    count: 0,
    resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
    strictCount: 0,
    strictResetTime: now + RATE_LIMIT_CONFIG.STRICT_WINDOW_MS,
  };

  // Reset counters if windows expired
  if (clientData.resetTime < now) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_LIMIT_CONFIG.WINDOW_MS;
  }

  if (clientData.strictResetTime < now) {
    clientData.strictCount = 0;
    clientData.strictResetTime = now + RATE_LIMIT_CONFIG.STRICT_WINDOW_MS;
  }

  clientData.count++;
  clientData.strictCount++;
  rateLimitMap.set(ip, clientData);

  const remaining = Math.max(
    0,
    RATE_LIMIT_CONFIG.MAX_REQUESTS - clientData.count
  );
  const allowed = clientData.count <= RATE_LIMIT_CONFIG.MAX_REQUESTS;
  const strictViolation =
    clientData.strictCount > RATE_LIMIT_CONFIG.MAX_STRICT_REQUESTS;

  return {
    allowed,
    remaining,
    resetTime: clientData.resetTime,
    strictViolation,
  };
}

// Enhanced audit log creation with better error handling and structured details
async function createAuditLog(
  adminUserId: string | null,
  action: string,
  details: {
    // Core fields
    operation?: string;
    result?: "success" | "failure" | "error";

    // NIN-related fields
    ninProvided?: boolean;
    ninValid?: boolean;

    // Admin-related fields
    adminFound?: boolean;
    adminId?: string;
    adminEmail?: string;
    adminRole?: string;
    adminActive?: boolean;
    adminVerified?: boolean;

    // School-related fields
    schoolsCount?: number;
    schoolIds?: string[];
    principalStatus?: boolean;
    principalOf?: string;

    // Security fields
    ipAddress?: string;
    userAgent?: string;
    rateLimitRemaining?: number;
    strictViolation?: boolean;

    // Error fields
    errorType?: string;
    errorMessage?: string;
    validationErrors?: Array<{ field: string; message: string }>;

    // Request body
    requestBody?: string[];

    // Restrictions
    restrictionType?: string;
    restrictionReason?: string;

    // Additional context
    timestamp?: string;
    requestId?: string;
    processingTimeMs?: number;
  },
  ipAddress: string | null,
  userAgent: string | null,
  schoolId?: string
) {
  try {
    // Generate request ID for tracking
    const requestId = `nin-lookup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Enhance details with metadata
    const enhancedDetails = {
      ...details,
      timestamp: new Date().toISOString(),
      requestId,
      operation: "nin_lookup",
      userAgent: userAgent?.substring(0, 500), // Limit length
      ipAddress: ipAddress?.substring(0, 45), // IPv6 max length
    };

    // Get or create system user for logging
    let logUserId = adminUserId;
    if (!logUserId) {
      const systemUser = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: process.env.SA_EMAIL || "system_sa@i3hub.com.ng" },
            { role: "Super_Admin" },
          ],
        },
        select: { id: true },
      });

      if (!systemUser) {
        console.error("System user not found for audit logging");
        return;
      }

      logUserId = systemUser.id;
    }

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: logUserId,
        action,
        details: enhancedDetails,
        ipAddress: ipAddress?.substring(0, 45) || "unknown",
        userAgent: userAgent?.substring(0, 500) || "unknown",
        ...(schoolId && { schoolId }),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", {
      action,
      error: error instanceof Error ? error.message : "Unknown error",
      adminUserId,
      schoolId,
    });
  }
}

// Enhanced error response helper
function createErrorResponse(
  message: string,
  errorCode: string,
  statusCode: number,
  additionalData?: Record<string, unknown>,
  rateLimitHeaders?: Record<string, string>
) {
  const response = {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  const headers = {
    "Content-Type": "application/json",
    ...rateLimitHeaders,
  };

  return NextResponse.json(response, { status: statusCode, headers });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  let adminUser: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    phone?: string;
    schools?: Array<{
      id: string;
      centerName: string;
      principalPhoneHash: string;
      isVerified: boolean;
      centerNumber: string;
    }>;
    _count?: {
      auditLogs: number;
      candidatesCreated: number;
    };
  } | null = null;
  let requestBody: { nin?: string } | null = null;

  try {
    // Enhanced rate limiting check
    const rateLimit = checkRateLimit(ipAddress);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": RATE_LIMIT_CONFIG.MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimit.resetTime / 1000).toString(),
    };

    if (!rateLimit.allowed || rateLimit.strictViolation) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_RATE_LIMITED,
        {
          result: "failure",
          errorType: "rate_limit_exceeded",
          rateLimitRemaining: rateLimit.remaining,
          strictViolation: rateLimit.strictViolation,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        rateLimit.strictViolation
          ? "Too many requests. Please wait before trying again."
          : "Rate limit exceeded. Please try again later.",
        "RATE_LIMIT_EXCEEDED",
        429,
        {
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        rateLimitHeaders
      );
    }

    // Parse request body with error handling
    try {
      requestBody = await request.json();
    } catch (parseError) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_VALIDATION_ERROR,
        {
          result: "error",
          errorType: "json_parse_error",
          errorMessage: "Invalid JSON in request body",
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        "Invalid JSON in request body",
        "INVALID_JSON",
        400,
        undefined,
        rateLimitHeaders
      );
    }

    // Enhanced input validation with Zod
    const validationResult = NINLookupSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const validationErrors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        value: err.input,
      }));

      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_VALIDATION_ERROR,
        {
          result: "failure",
          errorType: "validation_failed",
          validationErrors,
          ninProvided: !!requestBody?.nin,
          ninValid: false,
          rateLimitRemaining: rateLimit.remaining,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        { validationErrors },
        rateLimitHeaders
      );
    }

    const { nin } = validationResult.data;

    // Create initial audit log
    await createAuditLog(
      null,
      AUDIT_ACTIONS.NIN_LOOKUP_ATTEMPT,
      {
        result: "success",
        operation: "attempt",
        ninProvided: true,
        ninValid: true,
        rateLimitRemaining: rateLimit.remaining,
        ipAddress,
      },
      ipAddress,
      userAgent
    );

    // Protect NIN for database lookup with enhanced error handling
    let protectedNin;
    try {
      protectedNin = await protectData(nin, "nin");
    } catch (protectionError) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_DATA_PROTECTION_ERROR,
        {
          result: "error",
          errorType: "data_protection_error",
          errorMessage:
            protectionError instanceof Error
              ? protectionError.message
              : "Unknown protection error",
          ninProvided: true,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        "Failed to process NIN for search",
        "DATA_PROTECTION_ERROR",
        500,
        undefined,
        rateLimitHeaders
      );
    }

    if (!protectedNin?.searchHash) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_DATA_PROTECTION_ERROR,
        {
          result: "error",
          errorType: "protection_hash_missing",
          ninProvided: true,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        "Failed to generate search hash for NIN",
        "HASH_GENERATION_ERROR",
        500,
        undefined,
        rateLimitHeaders
      );
    }

    // Enhanced database lookup with better error handling
    try {
      adminUser = await prisma.adminUser.findFirst({
        where: {
          AND: [{ isActive: true }, { ninHash: protectedNin.searchHash }],
        },
        include: {
          schools: {
            where: { isActive: true },
            select: {
              id: true,
              centerName: true,
              principalPhoneHash: true,
              isVerified: true,
              centerNumber: true,
            },
          },
          _count: {
            select: {
              auditLogs: true,
              candidatesCreated: true,
            },
          },
        },
      });
    } catch (dbError) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          result: "error",
          errorType: "database_error",
          errorMessage:
            dbError instanceof Error
              ? dbError.message
              : "Database query failed",
          ninProvided: true,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return createErrorResponse(
        "Database error occurred during lookup",
        "DATABASE_ERROR",
        500,
        undefined,
        rateLimitHeaders
      );
    }

    // Determine principal status with enhanced logic
    let isPrincipal = false;
    let principalOf: string | undefined = undefined;

    if (adminUser?.phone && (adminUser.schools ?? []).length > 0) {
      try {
        const protectedPhone = await protectData(adminUser.phone, "phone");
        if (protectedPhone?.searchHash) {
          for (const school of adminUser.schools ?? []) {
            if (school.principalPhoneHash === protectedPhone.searchHash) {
              isPrincipal = true;
              principalOf = school.centerName;
              break;
            }
          }
        }
      } catch (phoneProtectionError) {
        console.warn(
          "Failed to verify principal status:",
          phoneProtectionError
        );
        // Continue without principal verification rather than failing
      }
    }

    const schoolsManaged = adminUser?.schools?.length ?? 0;
    const allSchoolsVerified =
      schoolsManaged > 0
        ? (adminUser?.schools?.every(
            (school: { isVerified: boolean }) => school.isVerified
          ) ?? false)
        : false;

    // Create comprehensive audit log for result
    const auditDetails = {
      result: adminUser ? ("success" as const) : ("failure" as const),
      adminFound: !!adminUser,
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      adminRole: adminUser?.role,
      adminActive: adminUser?.isActive,
      adminVerified: adminUser?.emailVerified,
      schoolsCount: schoolsManaged,
      schoolIds: adminUser?.schools?.map((s: { id: string }) => s.id) || [],
      principalStatus: isPrincipal,
      principalOf,
      rateLimitRemaining: rateLimit.remaining,
      processingTimeMs: Date.now() - startTime,
      ipAddress,
    };

    await createAuditLog(
      adminUser?.id || null,
      adminUser
        ? AUDIT_ACTIONS.NIN_LOOKUP_SUCCESS
        : AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
      auditDetails,
      ipAddress,
      userAgent,
      adminUser?.schools?.[0]?.id
    );

    // Handle admin not found case
    if (!adminUser) {
      return NextResponse.json(
        {
          success: true,
          data: {
            exists: false,
            readonly: false,
          },
          message:
            "Administrator not found. This will be a new administrator account.",
          processingTime: Date.now() - startTime,
        },
        {
          headers: rateLimitHeaders,
        }
      );
    }

    // Enhanced role-based restrictions with detailed audit logging
    if (adminUser.role === "Principal" && isPrincipal && schoolsManaged > 1) {
      await createAuditLog(
        adminUser.id || null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          ...auditDetails,
          result: "failure",
          restrictionType: "principal_multiple_schools",
          restrictionReason: "Principals cannot manage multiple schools",
        },
        ipAddress,
        userAgent,
        adminUser.schools?.[0]?.id || undefined
      );

      return createErrorResponse(
        "Principals cannot manage multiple schools. Each principal is restricted to one school.",
        "PRINCIPAL_RESTRICTION",
        409,
        {
          data: {
            exists: true,
            adminId: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            schoolsManaged,
            restriction: "PRINCIPAL_MULTIPLE_SCHOOLS",
          },
        },
        rateLimitHeaders
      );
    }

    if (adminUser.role === "Operator" && schoolsManaged >= 1) {
      await createAuditLog(
        adminUser.id || null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          ...auditDetails,
          result: "failure",
          restrictionType: "operator_school_limit",
          restrictionReason: "Operators are restricted to one school only",
        },
        ipAddress,
        userAgent,
        adminUser.schools?.[0]?.id
      );

      return createErrorResponse(
        "Operators are restricted to managing only one school.",
        "OPERATOR_RESTRICTION",
        409,
        {
          data: {
            exists: true,
            adminId: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            schoolsManaged,
            restriction: "OPERATOR_SINGLE_SCHOOL",
          },
        },
        rateLimitHeaders
      );
    }

    // Check email verification requirement
    if (!adminUser.emailVerified) {
      await createAuditLog(
        adminUser.id || null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          ...auditDetails,
          result: "failure",
          restrictionType: "email_verification_required",
          restrictionReason: "Email verification required before proceeding",
        },
        ipAddress,
        userAgent,
        adminUser.schools?.[0]?.id
      );

      return createErrorResponse(
        "Email verification required before proceeding with school management.",
        "EMAIL_VERIFICATION_REQUIRED",
        400,
        {
          data: {
            exists: true,
            adminId: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            verified: adminUser.emailVerified,
            verificationRequired: true,
          },
        },
        rateLimitHeaders
      );
    }

    // Success response with comprehensive data
    return NextResponse.json(
      {
        success: true,
        data: {
          exists: true,
          adminId: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          verified: adminUser.emailVerified,
          schoolsManaged,
          isPrincipal,
          principalOf,
          isActive: adminUser.isActive,
          role: adminUser.role,
          allSchoolsVerified,
          activityStats: {
            auditLogs: adminUser._count?.auditLogs ?? 0,
            candidatesCreated: adminUser._count?.candidatesCreated ?? 0,
          },
          readonly: true,
        },
        message: `Administrator verified successfully. Managing ${schoolsManaged} school(s). Admin information will be pre-filled and readonly.`,
        processingTime: Date.now() - startTime,
      },
      {
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error("NIN lookup error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      ipAddress,
      adminId: adminUser?.id,
      processingTime: Date.now() - startTime,
    });

    // Create comprehensive error audit log
    await createAuditLog(
      adminUser?.id || null,
      AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
      {
        result: "error",
        errorType: "unhandled_exception",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        processingTimeMs: Date.now() - startTime,
        requestBody: requestBody ? Object.keys(requestBody) : undefined,
        ipAddress,
      },
      ipAddress,
      userAgent,
      adminUser?.schools?.[0]?.id || undefined
    );

    // Determine error type and response
    let errorMessage = "Internal server error during NIN lookup";
    let errorCode = "INTERNAL_ERROR";
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = "Validation error";
      errorCode = "VALIDATION_ERROR";
      statusCode = 400;
    } else if (error instanceof Error) {
      if (
        error.message.includes("Prisma") ||
        error.message.includes("database")
      ) {
        errorMessage = "Database error";
        errorCode = "DATABASE_ERROR";
      } else if (
        error.message.includes("protect") ||
        error.message.includes("encrypt")
      ) {
        errorMessage = "Data protection error";
        errorCode = "DATA_PROTECTION_ERROR";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout";
        errorCode = "TIMEOUT_ERROR";
        statusCode = 504;
      }
    }

    const rateLimitHeaders = {
      "X-RateLimit-Limit": RATE_LIMIT_CONFIG.MAX_REQUESTS.toString(),
      "X-RateLimit-Remaining": "0",
    };

    return createErrorResponse(
      errorMessage,
      errorCode,
      statusCode,
      {
        processingTime: Date.now() - startTime,
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && {
            debugInfo: error.message,
          }),
      },
      rateLimitHeaders
    );
  }
}
