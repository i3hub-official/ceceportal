// File: src/app/api/auth/resend-verification/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JWTUtils } from "@/lib/utils/jwt";
import { protectData, unprotectData } from "@/lib/security/dataProtection";
import { EmailService } from "@/lib/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const { login, type } = await request.json();

    if (!login || !type) {
      return NextResponse.json(
        { success: false, message: "Login and type are required" },
        { status: 400 }
      );
    }

    if (type !== "school" && type !== "admin") {
      return NextResponse.json(
        { success: false, message: "Invalid verification type" },
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

    let school = null;
    let adminUser = null;

    if (isEmail) {
      // Try to find school by email hash
      school = await prisma.school.findFirst({
        where: {
          schoolEmailHash: searchHash,
        },
        include: {
          adminUsers: true,
        },
      });

      // If not found as school, try admin user
      if (!school) {
        adminUser = await prisma.adminUser.findFirst({
          where: {
            emailHash: searchHash,
          },
        });
      }
    } else {
      // Try to find school by phone hash
      school = await prisma.school.findFirst({
        where: {
          schoolPhoneHash: searchHash,
        },
        include: {
          adminUsers: true,
        },
      });

      // If not found as school, try admin user
      if (!school) {
        adminUser = await prisma.adminUser.findFirst({
          where: {
            phoneHash: searchHash,
          },
        });
      }
    }

    // Handle school verification
    if (type === "school" && school) {
      // Check if already verified
      if (school.emailVerified) {
        return NextResponse.json(
          { success: false, message: "School email is already verified" },
          { status: 400 }
        );
      }

      // Get the decrypted email
      const schoolEmail = await unprotectData(school.schoolEmail, "email");

      // Create a new verification token using JWTUtils
      const schoolToken = await JWTUtils.generateEmailVerificationToken({
        type: "school",
        email: schoolEmail,
        entityId: school.id,
        centerNumber: school.centerNumber,
      });

      // Delete any existing pending verification tokens for this school
      await prisma.emailVerification.deleteMany({
        where: {
          schoolId: school.id,
          status: "PENDING",
          type: "SCHOOL_EMAIL_VERIFICATION",
        },
      });

      // Create new verification record
      await prisma.emailVerification.create({
        data: {
          schoolId: school.id,
          emailHash: school.schoolEmailHash,
          token: schoolToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          type: "SCHOOL_EMAIL_VERIFICATION",
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      // Send verification email
      const emailService = EmailService.getInstance();
      await emailService.sendSchoolVerificationEmail(schoolEmail, {
        schoolName: school.centerName,
        centerNumber: school.centerNumber,
        verificationLink: `${emailService.getBaseUrl()}/center/verify-email?token=${schoolToken}&schoolId=${school.id}`,
        recipientName: school.centerName,
      });

      return NextResponse.json({
        success: true,
        message: "School verification email sent successfully",
      });
    }
    // Handle admin verification
    else if (type === "admin" && adminUser) {
      // Check if already verified
      if (adminUser.emailVerified) {
        return NextResponse.json(
          { success: false, message: "Admin email is already verified" },
          { status: 400 }
        );
      }

      // Get the decrypted email
      const adminEmail = await unprotectData(adminUser.email, "email");

      // Create a new verification token using JWTUtils
      const adminToken = await JWTUtils.generateEmailVerificationToken({
        type: "admin",
        email: adminEmail,
        entityId: adminUser.id,
      });

      // Delete any existing pending verification tokens for this admin
      await prisma.emailVerification.deleteMany({
        where: {
          adminId: adminUser.id,
          status: "PENDING",
          type: "ADMIN_EMAIL_VERIFICATION",
        },
      });

      // Create new verification record
      await prisma.emailVerification.create({
        data: {
          adminId: adminUser.id,
          emailHash: adminUser.emailHash,
          token: adminToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          type: "ADMIN_EMAIL_VERIFICATION",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      // Send verification email
      const emailService = EmailService.getInstance();
      await emailService.sendAdminVerificationEmail(adminEmail, {
        adminName: adminUser.name,
        verificationLink: `${emailService.getBaseUrl()}/admin/verify-email?token=${adminToken}&adminId=${adminUser.id}`,
        schoolName: "Unknown School", // Provide a default or fetch the actual school name if available
        recipientName: adminUser.name,
      });

      return NextResponse.json({
        success: true,
        message: "Admin verification email sent successfully",
      });
    }

    // If we get here, the user wasn't found
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while resending verification" },
      { status: 500 }
    );
  }
}