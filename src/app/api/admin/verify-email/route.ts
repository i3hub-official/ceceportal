// File: src/app/api/admin/verify-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JWTUtils } from "@/lib/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const { token, adminId } = await request.json();

    if (!token || !adminId) {
      return NextResponse.json(
        { success: false, message: "Token and admin ID are required" },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenData = await JWTUtils.verifyEmailToken(token);

    // Verify that the adminId in the token matches the one provided
    if (tokenData.entityId !== adminId) {
      return NextResponse.json(
        { success: false, message: "Invalid verification link" },
        { status: 400 }
      );
    }

    // Find the admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: adminId },
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (adminUser.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Update the admin user's email verification status
    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Update the email verification record
    await prisma.emailVerification.updateMany({
      where: {
        adminId,
        status: "PENDING",
        type: "ADMIN_EMAIL_VERIFICATION",
      },
      data: {
        status: "VERIFIED",
        used: true,
        usedAt: new Date(),
      },
    });

    // Log the verification action
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminId,
        action: "EMAIL_VERIFIED",
        details: { type: "admin" },
        ipAddress:
          request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    if (error instanceof Error && error.name === "JWTError") {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during email verification",
      },
      { status: 500 }
    );
  }
}


