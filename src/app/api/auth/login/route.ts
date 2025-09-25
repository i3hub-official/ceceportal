// File: src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { JWTUtils } from "@/lib/utils/jwt";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { verifyHash } from "@/lib/security/encryption";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { success: false, message: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    // Determine if login is email or phone
    const isEmail = login.includes("@");
    const loginType = isEmail ? "email" : "phone";

    // Normalize login based on type
    const normalizedLogin = isEmail ? login.trim().toLowerCase() : login.trim();

    // Generate searchable hash for the login
    const loginProtection = await protectData(normalizedLogin, loginType);
    const searchHash = loginProtection.searchHash;

    if (!searchHash) {
      return NextResponse.json(
        { success: false, message: "Invalid login format" },
        { status: 400 }
      );
    }

    // Try to find school by email or phone hash
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

    // Try to find admin user if school not found
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

    // If neither school nor admin user found
    if (!school && !adminUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    let user = null;
    let userType = null;
    let verificationRequired = null;

    // Handle school login
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
        (admin) => admin.role === "Admin" || admin.role === "Super_Admin"
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
        verificationRequired = {
          schoolEmail: true,
          adminEmail: !user.emailVerified,
        };

        return NextResponse.json({
          success: true,
          verificationRequired,
        });
      }
    }
    // Handle admin user login
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
        verificationRequired = {
          schoolEmail: false,
          adminEmail: true,
        };

        return NextResponse.json({
          success: true,
          verificationRequired,
        });
      }
    }

    // At this point, we have a valid user with verified email
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Get decrypted email for token
    const userEmail = await unprotectData(user.email, "email");

    // Get school information
    let centerNumber = "";
    if (user.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: user.schoolId },
        select: { centerNumber: true },
      });
      centerNumber = school?.centerNumber || "";
    }

    // Generate authentication token using JWTUtils
    const authToken = await JWTUtils.generateAuthToken({
      adminId: user.id,
      email: userEmail,
      schoolId: user.schoolId || "",
      role: user.role,
      centerNumber,
    });

    // Generate refresh token
    const refreshToken = await JWTUtils.generateRefreshToken(user.id);

    // Create session record
    const sessionToken = nanoid();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // 24 hours

    await prisma.session.create({
      data: {
        sessionToken,
        adminUserId: user.id,
        expires,
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "session-token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires,
    });

    // Set refresh token cookie
    cookieStore.set({
      name: "refresh-token",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Log the login action
    if (userType === "school") {
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          schoolId: user.schoolId,
          action: "LOGIN",
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } else {
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          action: "LOGIN",
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: userEmail,
        role: user.role,
        schoolId: user.schoolId,
        centerNumber,
      },
      token: authToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
