// ========================================
// 🔐 STEP 1: GENERATE ACCESS CODE ROUTE
// File: src/app/api/v1/auth/access-code/route.ts
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { verifyHash, hashData } from "@/lib/security/encryption";
import { getClientIp } from "@/lib/utils/client-ip";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { login, password, clientName = "API Client" } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { success: false, message: "Login and password are required" },
        { status: 400 }
      );
    }

    // Determine if login is email or phone (same logic as your login route)
    const isEmail = login.includes("@");
    const loginType = isEmail ? "email" : "phone";

    // Normalize login based on type (same logic as your login route)
    const normalizedLogin = isEmail ? login.trim().toLowerCase() : login.trim();

    // Generate searchable hash for the login (same logic as your login route)
    const loginProtection = await protectData(normalizedLogin, loginType);
    const searchHash = loginProtection.searchHash;

    if (!searchHash) {
      return NextResponse.json(
        { success: false, message: "Invalid login format" },
        { status: 400 }
      );
    }

    // Try to find school by email or phone hash (same logic as your login route)
    let school = null;
    if (isEmail) {
      school = await prisma.school.findFirst({
        where: { schoolEmailHash: searchHash },
        include: { adminUsers: true },
      });
    } else {
      school = await prisma.school.findFirst({
        where: { schoolPhoneHash: searchHash },
        include: { adminUsers: true },
      });
    }

    // Try to find admin user if school not found (same logic as your login route)
    let adminUser = null;
    if (!school) {
      if (isEmail) {
        adminUser = await prisma.adminUser.findFirst({
          where: { emailHash: searchHash },
          include: { school: true },
        });
      } else {
        adminUser = await prisma.adminUser.findFirst({
          where: { phoneHash: searchHash },
          include: { school: true },
        });
      }
    }

    // If neither school nor admin user found (same logic as your login route)
    if (!school && !adminUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    let user = null;
    let userType = null;
    
    // Handle school login (same logic as your login route)
    if (school) {
      // Check if school is active
      if (!school.isActive) {
        return NextResponse.json(
          { success: false, message: "School account is deactivated" },
          { status: 403 }
        );
      }

      // Get the primary admin user for the school
      const primaryAdmin = school.adminUsers.find(
        (admin: { role: string }) =>
          admin.role === "Admin" || admin.role === "Super_Admin"
      );

      if (!primaryAdmin) {
        return NextResponse.json(
          {
            success: false,
            message: "No admin user associated with this school",
          },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await verifyHash(password, primaryAdmin.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      user = primaryAdmin;
      userType = "school";

      // Check if school email is verified
      if (!school.emailVerified) {
        return NextResponse.json({
          success: false,
          message: "School email must be verified to access API",
        }, { status: 403 });
      }
    }
    // Handle admin user login (same logic as your login route)
    else if (adminUser) {
      // Check if admin user is active
      if (!adminUser.isActive) {
        return NextResponse.json(
          { success: false, message: "Admin account is deactivated" },
          { status: 403 }
        );
      }

      // Verify password
      const isPasswordValid = await verifyHash(password, adminUser.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      user = adminUser;
      userType = "admin";

      // Check if admin email is verified
      if (!user.emailVerified) {
        return NextResponse.json({
          success: false,
          message: "User email must be verified to access API",
        }, { status: 403 });
      }
    }

    // At this point, we have a valid user with verified email (same logic as your login route)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Check for existing active API client for this user
    const existingClient = await prisma.apiClient.findFirst({
      where: {
        createdBy: user.id,
        isActive: true,
        name: { contains: clientName },
      }
    });

    let apiClient;

    if (existingClient) {
      // Update existing client's last used timestamp
      apiClient = await prisma.apiClient.update({
        where: { id: existingClient.id },
        data: { lastUsedAt: new Date() }
      });
    } else {
      // Create new API client
      const accessCode = `ak_${nanoid(32)}`;
      const secretKey = `sk_${nanoid(64)}`;
      const hashedSecret = await hashData(secretKey);

      // Define scopes based on user role (same logic as your login route)
      const scopes = user.role === "Super_Admin" 
        ? ["admin:all"] 
        : user.role === "Admin"
        ? ["read:all", "write:all", "admin:audit"]
        : ["read:all"];

      apiClient = await prisma.apiClient.create({
        data: {
          name: `${clientName} - ${user.name}`,
          description: `Auto-generated API client for ${user.name}`,
          accessCode,
          secretKey: hashedSecret,
          scopes,
          schoolId: user.schoolId,
          createdBy: user.id,
          rateLimit: 1000,
          allowedIps: [], // No IP restrictions by default
          lastUsedAt: new Date(),
        }
      });
    }

    // Get decrypted email for response (same logic as your login route)
    const userEmail = await unprotectData(user.email, "email");

    // Get school information (same logic as your login route)
    let centerNumber = "";
    if (user.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: { centerNumber: true },
      });
      centerNumber = school?.centerNumber || "";
    }

    // Determine scopes based on user role
    const userScopes = user.role === "Super_Admin" 
      ? ["admin:all"] 
      : user.role === "Admin"
      ? ["read:all", "write:all", "admin:audit"]
      : ["read:all"];

    // Calculate expiration (access codes expire in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Log the access code generation (same pattern as your login route)
    if (userType === "school") {
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          schoolId: user.schoolId,
          action: "API_ACCESS_CODE_GENERATED",
          details: {
            apiClientId: apiClient.id,
            apiClientName: apiClient.name,
            scopes: userScopes,
            expiresAt: expiresAt.toISOString(),
          },
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          processingTimeMs: Date.now() - startTime,
        },
      });
    } else {
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          action: "API_ACCESS_CODE_GENERATED",
          details: {
            apiClientId: apiClient.id,
            apiClientName: apiClient.name,
            scopes: userScopes,
            expiresAt: expiresAt.toISOString(),
          },
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          processingTimeMs: Date.now() - startTime,
        },
      });
    }

    // Return success response (same pattern as your login route)
    return NextResponse.json({
      success: true,
      message: "Access code generated successfully",
      data: {
        accessCode: apiClient.accessCode,
        expiresAt: expiresAt.toISOString(),
        scopes: userScopes,
        rateLimit: apiClient.rateLimit,
        user: {
          id: user.id,
          name: user.name,
          email: userEmail,
          role: user.role,
          schoolId: user.schoolId,
          centerNumber,
        },
        client: {
          id: apiClient.id,
          name: apiClient.name,
        },
      },
    });

  } catch (error) {
    console.error("Access code generation error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during access code generation" },
      { status: 500 }
    );
  }
}