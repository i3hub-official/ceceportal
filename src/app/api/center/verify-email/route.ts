// src/app/api/center/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JWTUtils } from "@/lib/utils/jwt";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const schoolId = searchParams.get("schoolId");

    if (!token || !schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link. Missing token or school ID.",
        },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenData = await JWTUtils.verifyEmailToken(token);
    
    if (!tokenData || tokenData.type !== "school") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token.",
        },
        { status: 400 }
      );
    }

    // Check if the token matches the school ID
    if (tokenData.entityId !== schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link. School ID mismatch.",
        },
        { status: 400 }
      );
    }

    // Get client info for audit logging
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check if token exists and is valid in database
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        token,
        schoolId,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!emailVerification) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification link.",
        },
        { status: 400 }
      );
    }

    // Get the school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return NextResponse.json(
        {
          success: false,
          message: "School not found.",
        },
        { status: 404 }
      );
    }

    // Update school email verification status
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { 
        emailVerified: true,
        emailVerifiedAt: new Date(),
        verifiedBy: "EMAIL_VERIFICATION",
      },
    });

    // Update email verification token status
    await prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: {
        status: "VERIFIED",
        used: true,
        usedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: school.adminId || "system",
        action: "SCHOOL_EMAIL_VERIFIED",
        details: {
          schoolId: school.id,
          schoolName: school.centerName,
          centerNumber: school.centerNumber,
          verificationDate: new Date().toISOString(),
        },
        ipAddress,
        userAgent,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "School email verified successfully!",
        schoolName: updatedSchool.centerName,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("School email verification error:", error);

    // Check if it's a JWT error
    if (error instanceof Error && error.name === "JWTError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification link.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during email verification.",
      },
      { status: 500 }
    );
  }
}