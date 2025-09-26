// src/app/api/center/verify-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { JWTUtils } from "@/lib/server/jwt";

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

async function handleVerification(request: NextRequest) {
  try {
    let token: string | null = null;
    let schoolId: string | null = null;

    if (request.method === "GET") {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
      schoolId = searchParams.get("schoolId");
    } else {
      const body = await request.json();
      token = body.token;
      schoolId = body.schoolId;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification link. Missing token.",
        },
        { status: 400 }
      );
    }

    // Get client info for audit logging
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

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

    // Extract school ID from token if not provided
    const targetSchoolId = schoolId || tokenData.entityId;

    // Check if token exists and is valid in database
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        token,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
        ...(targetSchoolId && { schoolId: targetSchoolId }),
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

    // Use schoolId from database record if available
    const dbSchoolId = emailVerification.schoolId || targetSchoolId;

    // Get the school
    const school = await prisma.school.findUnique({
      where: { id: dbSchoolId },
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

    // Get system user for audit logging
    let systemUser = null;
    try {
      systemUser = await prisma.adminUser.findUnique({
        where: { email: process.env.SA_EMAIL || "system_sa@i3hub.com.ng" },
      });
    } catch (error) {
      console.error("Error finding system user:", error);
    }

    // Update school email verification status
    const updatedSchool = await prisma.school.update({
      where: { id: dbSchoolId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        verifiedBy: systemUser?.id || null,
      },
    });

    // Update email verification token status
    await prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: {
        status: "VERIFIED",
        used: true,
        usedAt: new Date(),
        failureReason: null,
      },
    });

    // Create audit log if system user exists
    if (systemUser) {
      try {
        await prisma.adminAuditLog.create({
          data: {
            adminUserId: systemUser.id,
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
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
        // Continue even if audit log fails
      }
    }

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
