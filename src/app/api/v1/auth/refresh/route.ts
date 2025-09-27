// ========================================
// 🔄 TOKEN REFRESH ROUTE (Optional)
// File: src/app/api/v1/auth/refresh/route.ts
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { ApiJWTUtils } from "@/lib/server/apiJwt";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { verifyHash } from "@/lib/security/encryption";
import { getClientIp } from "@/lib/utils/client-ip";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Get current token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_TOKEN",
            message: "Bearer token required",
          },
          meta: {
            processingTimeMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            apiVersion: "1.0",
          },
        },
        { status: 401 }
      );
    }

    const currentToken = authHeader.replace("Bearer ", "");
    const body = await request.json();
    const { expiresIn = "1h" } = body;

    // Get access code from header
    const accessCode = request.headers.get("X-Access-Code");
    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ACCESS_CODE",
            message: "X-Access-Code header required",
          },
          meta: {
            processingTimeMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            apiVersion: "1.0",
          },
        },
        { status: 401 }
      );
    }

    // Find API client
    const apiClient = await prisma.apiClient.findUnique({
      where: { accessCode, isActive: true },
    });

    if (!apiClient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ACCESS_CODE",
            message: "Invalid access code",
          },
          meta: {
            processingTimeMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            apiVersion: "1.0",
          },
        },
        { status: 401 }
      );
    }

    // Verify current token
    let tokenPayload;
    try {
      tokenPayload = await ApiJWTUtils.verifyApiToken(
        currentToken,
        apiClient.secretKey
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Current token is invalid or expired",
          },
          meta: {
            processingTimeMs: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            apiVersion: "1.0",
          },
        },
        { status: 401 }
      );
    }

    // Generate new token
    const newAccessToken = await ApiJWTUtils.generateApiToken(
      {
        clientId: apiClient.id,
        accessCode: apiClient.accessCode,
        secretKey: apiClient.secretKey,
        scopes: apiClient.scopes,
        schoolId: apiClient.schoolId || undefined,
      },
      {
        expiresIn,
        ipAddress: getClientIp(request) ?? undefined,
      }
    );

    // Update last used timestamp
    await prisma.apiClient.update({
      where: { id: apiClient.id },
      data: { lastUsedAt: new Date() },
    });

    const response = {
      success: true,
      data: {
        accessToken: newAccessToken,
        tokenType: "Bearer" as const,
        expiresIn,
        scopes: apiClient.scopes,
      },
      meta: {
        processingTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        apiVersion: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[TOKEN REFRESH] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to refresh token" },
        meta: {
          processingTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          apiVersion: "1.0",
        },
      },
      { status: 500 }
    );
  }
}
