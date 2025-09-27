// ========================================
// 🔑 STEP 2: GENERATE JWT TOKEN ROUTE
// File: src/app/api/v1/auth/token/route.ts
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { ApiJWTUtils } from "@/lib/server/apiJwt";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { getClientIp } from "@/lib/utils/client-ip";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { login, accessCode, expiresIn = "1h" } = await request.json();

    if (!login || !accessCode) {
      return NextResponse.json(
        { success: false, message: "Login and access code are required" },
        { status: 400 }
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
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailHash: true,
            phoneHash: true,
            isActive: true,
            emailVerified: true,
            schoolId: true,
          },
        },
      },
    });

    if (!apiClient) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive access code" },
        { status: 401 }
      );
    }

    // Check if associated school is active (if applicable)
    if (apiClient.school && !apiClient.school.isActive) {
      return NextResponse.json(
        { success: false, message: "Associated school is inactive" },
        { status: 403 }
      );
    }

    // Check IP restrictions (using same pattern as your login route)
    const clientIp =
      getClientIp(request) ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";

    if (
      apiClient.allowedIps.length > 0 &&
      !apiClient.allowedIps.includes(clientIp)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "IP address not allowed for this API client",
        },
        { status: 403 }
      );
    }

    // Verify login matches the API client owner (same logic as your login route)
    const isEmail = login.includes("@");
    const normalizedLogin = isEmail ? login.trim().toLowerCase() : login.trim();
    const loginProtection = await protectData(
      normalizedLogin,
      isEmail ? "email" : "phone"
    );
    const searchHash = loginProtection.searchHash;

    const userHashMatches = isEmail
      ? apiClient.adminUser.emailHash === searchHash
      : apiClient.adminUser.phoneHash === searchHash;

    if (!userHashMatches) {
      return NextResponse.json(
        { success: false, message: "Login does not match access code owner" },
        { status: 403 }
      );
    }

    // Check if admin user is still active and verified
    if (!apiClient.adminUser.isActive) {
      return NextResponse.json(
        { success: false, message: "User account is inactive" },
        { status: 403 }
      );
    }

    if (!apiClient.adminUser.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "User email must be verified to access API",
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const accessToken = await ApiJWTUtils.generateApiToken(
      {
        clientId: apiClient.id,
        accessCode: apiClient.accessCode,
        secretKey: apiClient.secretKey,
        scopes: apiClient.scopes,
        schoolId: apiClient.schoolId || undefined,
      },
      {
        expiresIn,
        ipAddress: clientIp,
      }
    );

    // Update API client last used timestamp
    await prisma.apiClient.update({
      where: { id: apiClient.id },
      data: { lastUsedAt: new Date() },
    });

    // Update admin user last login timestamp (same as your login route)
    await prisma.adminUser.update({
      where: { id: apiClient.createdBy },
      data: { lastLoginAt: new Date() },
    });

    // Get decrypted email for response (same logic as your login route)
    const userEmail = await unprotectData(apiClient.adminUser.email, "email");

    // Get school information (same logic as your login route)
    let centerNumber = "";
    if (apiClient.adminUser.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: apiClient.adminUser.schoolId },
        select: { centerNumber: true },
      });
      centerNumber = school?.centerNumber || "";
    }

    // Log the token generation (same pattern as your login route)
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: apiClient.createdBy,
        schoolId: apiClient.schoolId,
        action: "API_TOKEN_GENERATED",
        details: {
          apiClientId: apiClient.id,
          apiClientName: apiClient.name,
          expiresIn,
          scopes: apiClient.scopes,
        },
        ipAddress: clientIp,
        userAgent: request.headers.get("user-agent") || "unknown",
        processingTimeMs: Date.now() - startTime,
      },
    });

    // Return success response (same pattern as your login route)
    return NextResponse.json({
      success: true,
      message: "API token generated successfully",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn,
        scopes: apiClient.scopes,
        user: {
          id: apiClient.adminUser.id,
          name: apiClient.adminUser.name,
          email: userEmail,
          role: apiClient.adminUser.role,
          schoolId: apiClient.adminUser.schoolId,
          centerNumber,
        },
        client: {
          id: apiClient.id,
          name: apiClient.name,
          rateLimit: apiClient.rateLimit,
        },
      },
    });
  } catch (error) {
    console.error("API token generation error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during token generation" },
      { status: 500 }
    );
  }
}
