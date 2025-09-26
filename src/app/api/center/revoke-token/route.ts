// src/app/api/center/revoke-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, reason } = await request.json();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Token is required.",
        },
        { status: 400 }
      );
    }

    // Update token status in database
    const emailVerification = await prisma.emailVerification.updateMany({
      where: { token },
      data: {
        status: "REVOKED",
        failureReason: reason || "MANUALLY_REVOKED",
      },
    });

    if (emailVerification.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Token not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Token has been revoked successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token revocation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while revoking the token.",
      },
      { status: 500 }
    );
  }
}
