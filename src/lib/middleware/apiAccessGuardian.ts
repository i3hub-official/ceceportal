// ========================================
// 🛡️ TASK 8: API ACCESS GUARDIAN - JWT Validator
// Responsibility: Validate API access tokens and permissions
// ========================================

// File: src/lib/middleware/apiAccessGuardian.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { ApiJWTUtils, ApiJWTError } from "@/lib/server/apiJwt";
import { JWTClientUtils } from "@/lib/server/jwt";
import { getClientIp } from "@/lib/utils/client-ip";
import type { MiddlewareContext } from "./types";

interface ApiContext extends MiddlewareContext {
  isApiPath: boolean;
  apiClient?: {
    id: string;
    name: string;
    accessCode: string;
    scopes: string[];
    schoolId?: string;
    rateLimit: number;
    allowedIps: string[];
  };
  requestedScopes?: string[];
}

export class ApiAccessGuardian {
  private static readonly API_PATH_PREFIX = "/api/v1";

  private static readonly SCOPE_REQUIREMENTS: Record<string, string[]> = {
    "/api/v1/students": ["read:students"],
    "/api/v1/students/create": ["write:students"],
    "/api/v1/grades": ["read:grades"],
    "/api/v1/grades/update": ["write:grades"],
    "/api/v1/reports": ["read:reports"],
    "/api/v1/admin": ["admin:all"],
  };

  static isApiPath(pathname: string): boolean {
    return pathname.startsWith(this.API_PATH_PREFIX);
  }

  static async guard(
    request: NextRequest,
    context: MiddlewareContext
  ): Promise<NextResponse> {
    const pathname = request.nextUrl.pathname;

    // Skip if not API path
    if (!this.isApiPath(pathname)) {
      return NextResponse.next();
    }

    try {
      // Extract Bearer token
      const authHeader = request.headers.get("Authorization");
      const token = JWTClientUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        return this.createErrorResponse(
          "Missing API access token",
          401,
          "MISSING_TOKEN"
        );
      }

      // Extract access code from headers
      const accessCode = request.headers.get("X-Access-Code");
      if (!accessCode) {
        return this.createErrorResponse(
          "Missing access code",
          401,
          "MISSING_ACCESS_CODE"
        );
      }

      // Find API client by access code
      const apiClient = await prisma.apiClient.findUnique({
        where: {
          accessCode,
          isActive: true,
        },
        include: {
          school: {
            select: { id: true, isActive: true },
          },
        },
      });

      if (!apiClient) {
        return this.createErrorResponse(
          "Invalid access code",
          401,
          "INVALID_ACCESS_CODE"
        );
      }

      // Check if school is active (if client is tied to a school)
      if (apiClient.school && !apiClient.school.isActive) {
        return this.createErrorResponse(
          "Associated school is inactive",
          403,
          "SCHOOL_INACTIVE"
        );
      }

      // Verify JWT token with client's secret
      let tokenPayload;
      try {
        tokenPayload = await ApiJWTUtils.verifyApiToken(
          token,
          apiClient.secretKey
        );
      } catch (error) {
        if (error instanceof ApiJWTError) {
          return this.createErrorResponse(error.message, 401, error.code);
        }
        return this.createErrorResponse(
          "Token verification failed",
          401,
          "VERIFICATION_FAILED"
        );
      }

      // Verify token matches access code
      if (tokenPayload.accessCode !== accessCode) {
        return this.createErrorResponse(
          "Token and access code mismatch",
          401,
          "TOKEN_MISMATCH"
        );
      }

      // Check IP restrictions
      const clientIp = getClientIp(request) || "unknown";
      if (
        apiClient.allowedIps.length > 0 &&
        !apiClient.allowedIps.includes(clientIp)
      ) {
        return this.createErrorResponse(
          "IP address not allowed",
          403,
          "IP_RESTRICTED"
        );
      }

      // Check scopes
      const requiredScopes = this.getRequiredScopes(pathname, request.method);
      const hasRequiredScopes = requiredScopes.every(
        (scope) =>
          tokenPayload.scopes.includes(scope) ||
          tokenPayload.scopes.includes("admin:all")
      );

      if (!hasRequiredScopes) {
        return this.createErrorResponse(
          `Insufficient permissions. Required: ${requiredScopes.join(", ")}`,
          403,
          "INSUFFICIENT_SCOPES"
        );
      }

      // Update last used timestamp
      await prisma.apiClient.update({
        where: { id: apiClient.id },
        data: { lastUsedAt: new Date() },
      });

      // Log API usage
      await this.logApiUsage(apiClient.id, request, 200, Date.now());

      // Create response with API context
      const response = NextResponse.next();
      response.headers.set("x-api-client-id", apiClient.id);
      response.headers.set("x-api-client-name", apiClient.name);
      response.headers.set("x-api-scopes", tokenPayload.scopes.join(","));

      console.log(
        `[API GUARDIAN] ✅ API access granted for client: ${apiClient.name}`
      );
      return response;
    } catch (error) {
      console.error("[API GUARDIAN] ❌ Error validating API access:", error);
      return this.createErrorResponse(
        "Internal server error",
        500,
        "INTERNAL_ERROR"
      );
    }
  }

  private static getRequiredScopes(pathname: string, method: string): string[] {
    // Check exact path match first
    const exactMatch = this.SCOPE_REQUIREMENTS[pathname];
    if (exactMatch) return exactMatch;

    // Check method-specific requirements
    const methodKey = `${pathname}:${method.toLowerCase()}`;
    const methodMatch = this.SCOPE_REQUIREMENTS[methodKey];
    if (methodMatch) return methodMatch;

    // Default scope requirements based on method
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return ["write:all"];
    }

    return ["read:all"];
  }

  private static createErrorResponse(
    message: string,
    status: number,
    code: string
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: { message, code },
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  private static async logApiUsage(
    clientId: string,
    request: NextRequest,
    statusCode: number,
    startTime: number
  ): Promise<void> {
    try {
      await prisma.apiUsageLog.create({
        data: {
          clientId,
          endpoint: request.nextUrl.pathname,
          method: request.method,
          ipAddress: getClientIp(request) || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          statusCode,
          responseTime: Date.now() - startTime,
          requestId: request.headers.get("x-request-id") || undefined,
        },
      });
    } catch (error) {
      console.error("Failed to log API usage:", error);
      // Don't fail the request if logging fails
    }
  }
}
