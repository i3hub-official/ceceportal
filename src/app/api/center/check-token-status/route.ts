// src/app/api/center/check-token-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JWTUtils } from "@/lib/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json();

    if (!token || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Token and type are required.",
        },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenData = await JWTUtils.verifyEmailToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 400 }
      );
    }

    // Check token type
    if (tokenData.type !== type) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token type.",
        },
        { status: 400 }
      );
    }

    // Check token status in database
    const emailVerification = await prisma.emailVerification.findFirst({
      where: { token },
    });

    if (!emailVerification) {
      return NextResponse.json(
        {
          success: false,
          message: "Token not found in database.",
        },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (new Date() > emailVerification.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Token has expired.",
          status: "EXPIRED",
        },
        { status: 400 }
      );
    }

    // Check if token is already used
    if (emailVerification.used) {
      return NextResponse.json(
        {
          success: false,
          message: "Token has already been used.",
          status: "USED",
        },
        { status: 400 }
      );
    }

    // Return token status
    return NextResponse.json(
      {
        success: true,
        message: "Token is valid.",
        status: emailVerification.status,
        expiresAt: emailVerification.expiresAt,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Token status check error:", error);

    // Check if it's a JWT error
    if (error instanceof Error && error.name === "JWTError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while checking token status.",
      },
      { status: 500 }
    );
  }
}