// src/app/api/admin/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { JWTUtils, JWTError } from "@/lib/server/jwt";

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

async function handleVerification(request: NextRequest) {
  try {
    let token: string | null = null;
    let adminId: string | null = null;

    if (request.method === "GET") {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
      adminId = searchParams.get("adminId");
    } else {
      const body = await request.json();
      token = body.token;
      adminId = body.adminId;
    }

    if (!token || !adminId) {
      return NextResponse.json(
        { success: false, message: "Token and admin ID are required" },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Verify JWT token
    const tokenData = await JWTUtils.verifyEmailToken(token);

    if (
      !tokenData ||
      tokenData.type !== "admin" ||
      tokenData.entityId !== adminId
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification link" },
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

    if (adminUser.id !== tokenData.entityId) {
      return NextResponse.json(
        { success: false, message: "Incorrect user's token" },
        { status: 400 }
      );
    }

    if (adminUser.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Get system user for audit logging fallback
    let systemUser = null;
    try {
      systemUser = await prisma.adminUser.findUnique({
        where: { email: process.env.SA_EMAIL || "system@example.com" },
      });
    } catch (error) {
      console.error("Error finding system user:", error);
    }

    // Check emailVerification token
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        adminId,
        token,
        status: "PENDING",
        expiresAt: { gt: new Date() },
        type: "ADMIN_EMAIL_VERIFICATION",
      },
    });

    if (!emailVerification) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update admin email verification
    const updatedAdmin = await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark this token as used
    await prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: { status: "VERIFIED", used: true, usedAt: new Date() },
    });

    // Create audit log
    if (systemUser) {
      try {
        await prisma.adminAuditLog.create({
          data: {
            adminUserId: systemUser.id,
            action: "ADMIN_EMAIL_VERIFIED",
            details: {
              adminId: updatedAdmin.id,
              email: updatedAdmin.email,
              verificationDate: new Date().toISOString(),
            },
            ipAddress,
            userAgent,
          },
        });
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin email verified successfully",
      adminEmail: updatedAdmin.email,
    });
  } catch (error) {
    console.error("Admin email verification error:", error);

    if (error instanceof JWTError) {
      let message = "Invalid or expired verification link";
      if (error.code === "TOKEN_EXPIRED")
        message = "Verification link has expired";
      if (error.code === "INVALID_TOKEN" || error.code === "INVALID_SIGNATURE")
        message = "Invalid verification link";
      if (error.code === "INVALID_TOKEN_TYPE")
        message = "Invalid verification token type";

      return NextResponse.json({ success: false, message }, { status: 400 });
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
