// /src/app/api/admin/nin-lookup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectData } from "@/lib/security/dataProtection";
import { z } from "zod";

// Zod schema for input validation
const NINLookupSchema = z.object({
  nin: z
    .string()
    .min(10)
    .max(20)
    .regex(/^[A-Za-z0-9]+$/),
});

// Rate limiting store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Audit log actions
const AUDIT_ACTIONS = {
  NIN_LOOKUP_ATTEMPT: "NIN_LOOKUP_ATTEMPT",
  NIN_LOOKUP_SUCCESS: "NIN_LOOKUP_SUCCESS",
  NIN_LOOKUP_FAILED: "NIN_LOOKUP_FAILED",
  SECURITY_ALERT: "SECURITY_ALERT",
} as const;

interface NINLookupResponse {
  success: boolean;
  data?: {
    exists: boolean;
    adminId?: string;
    name?: string;
    email?: string;
    phone?: string;
    verified?: boolean;
    schoolsManaged?: number;
    isPrincipal?: boolean;
    principalOf?: string | null;
    isActive?: boolean;
    role?: string;
    allSchoolsVerified?: boolean;
    activityStats?: {
      auditLogs: number;
      candidatesCreated: number;
    };
    readonly?: boolean; // New field to indicate if admin info should be readonly
  };
  message: string;
  error?: string;
}

// Rate limiting middleware
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const clientData = rateLimitMap.get(ip) || {
    count: 0,
    resetTime: now + RATE_LIMIT_WINDOW_MS,
  };

  if (clientData.resetTime < now) {
    clientData.count = 0;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  clientData.count++;
  rateLimitMap.set(ip, clientData);

  const remaining = Math.max(0, RATE_LIMIT_MAX - clientData.count);
  const allowed = clientData.count <= RATE_LIMIT_MAX;

  return { allowed, remaining };
}

// Create audit log entry
async function createAuditLog(
  adminUserId: string | null,
  action: string,
  details: any,
  ipAddress: string | null,
  userAgent: string | null,
  schoolId?: string
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminUserId || "system",
        action,
        details,
        ipAddress,
        userAgent,
        // Removed school property as it is not assignable
        ...(schoolId && {}),
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function POST(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  let adminUser: any = null;

  try {
    // Rate limiting check
    const rateLimit = checkRateLimit(ipAddress);
    if (!rateLimit.allowed) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          reason: "rate_limit_exceeded",
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        {
          success: false,
          message: "Rate limit exceeded. Please try again later.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    }

    const body = await request.json();

    // Input validation with Zod
    const validationResult = NINLookupSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          reason: "validation_failed",
          errors,
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "VALIDATION_ERROR",
          details: errors,
        },
        { status: 400 }
      );
    }

    const { nin } = validationResult.data;

    console.log("🔍 NIN lookup request:", { ninLength: nin.length });

    // Create initial audit log
    await createAuditLog(
      null,
      AUDIT_ACTIONS.NIN_LOOKUP_ATTEMPT,
      {
        ninProvided: true,
        ipAddress,
      },
      ipAddress,
      userAgent
    );

    // Protect NIN for database lookup
    const protectedNin = await protectData(nin, "nin");
    if (!protectedNin) {
      await createAuditLog(
        null,
        AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
        {
          reason: "nin_processing_error",
          ipAddress,
        },
        ipAddress,
        userAgent
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to process NIN for search",
          error: "NIN_PROCESSING_ERROR",
        },
        { status: 400 }
      );
    }

    // Search for admin in database by NIN
    adminUser = await prisma.adminUser.findFirst({
      where: {
        isActive: true,
        ninHash: protectedNin.searchHash,
      },
      include: {
        schools: {
          where: {
            isActive: true,
          },
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

    // Create audit log for lookup result
    await createAuditLog(
      adminUser?.id || null,
      adminUser
        ? AUDIT_ACTIONS.NIN_LOOKUP_SUCCESS
        : AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
      {
        adminFound: !!adminUser,
        adminId: adminUser?.id,
        schoolsCount: adminUser?.schools.length || 0,
        ipAddress,
      },
      ipAddress,
      userAgent,
      adminUser?.schools[0]?.id
    );

    if (!adminUser) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          readonly: false,
        },
        message:
          "Administrator not found. This will be a new administrator account.",
      });
    }

    // Check if admin is principal for any school
    let isPrincipal = false;
    let principalOf = null;

    // For NIN lookup, we need to check if the admin's phone matches any school's principal phone
    // We'll need to protect the admin's phone to compare with principalPhoneHash
    if (adminUser.phone) {
      const protectedPhone = await protectData(adminUser.phone, "phone");
      if (protectedPhone && adminUser.schools.length > 0) {
        for (const school of adminUser.schools) {
          if (school.principalPhoneHash === protectedPhone.searchHash) {
            isPrincipal = true;
            principalOf = school.centerName;
            break;
          }
        }
      }
    }

    const schoolsManaged = adminUser.schools.length;
    const allSchoolsVerified =
      adminUser.schools.length > 0
        ? adminUser.schools.every(
            (school: { isVerified: boolean }) => school.isVerified
          )
        : false;

    // Check restrictions based on role
    if (adminUser.role === "Principal" && isPrincipal && schoolsManaged > 1) {
      return NextResponse.json(
        {
          success: false,
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
              auditLogs: adminUser._count.auditLogs,
              candidatesCreated: adminUser._count.candidatesCreated,
            },
          },
          message:
            "Principals cannot manage multiple schools. Each principal is restricted to one school.",
          error: "PRINCIPAL_RESTRICTION",
        },
        { status: 409 }
      );
    }

    if (adminUser.role === "Operator" && schoolsManaged >= 1) {
      return NextResponse.json(
        {
          success: false,
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
              auditLogs: adminUser._count.auditLogs,
              candidatesCreated: adminUser._count.candidatesCreated,
            },
          },
          message: "Operators are restricted to managing only one school.",
          error: "OPERATOR_RESTRICTION",
        },
        { status: 409 }
      );
    }

    // Check email verification
    if (!adminUser.emailVerified) {
      return NextResponse.json(
        {
          success: false,
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
              auditLogs: adminUser._count.auditLogs,
              candidatesCreated: adminUser._count.candidatesCreated,
            },
          },
          message:
            "Email verification required before proceeding with school management.",
          error: "EMAIL_VERIFICATION_REQUIRED",
        },
        { status: 400 }
      );
    }

    // Success response with readonly flag
    return NextResponse.json({
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
          auditLogs: adminUser._count.auditLogs,
          candidatesCreated: adminUser._count.candidatesCreated,
        },
        readonly: true, // Flag to indicate that admin info should be readonly
      },
      message: `Administrator verified successfully. Managing ${schoolsManaged} school(s). Admin information will be pre-filled and readonly.`,
    });
  } catch (error) {
    console.error("❌ NIN lookup error:", error);

    // Create error audit log
    await createAuditLog(
      adminUser?.id || null,
      AUDIT_ACTIONS.NIN_LOOKUP_FAILED,
      {
        error: error instanceof Error ? error.message : "Unknown error",
        ipAddress,
        stack: error instanceof Error ? error.stack : undefined,
      },
      ipAddress,
      userAgent,
      adminUser?.schools[0]?.id
    );

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
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorCode,
        details:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      {
        status: statusCode,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
}
