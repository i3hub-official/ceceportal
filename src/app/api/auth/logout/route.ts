// File: src/app/api/auth/signout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { cookies } from "next/headers";
import { JWTUtils, JWTClientUtils } from "@/lib/server/jwt";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Get tokens from cookies
    const sessionToken = cookieStore.get("session-token")?.value;
    const refreshToken = cookieStore.get("refresh-token")?.value;
    const authHeader = request.headers.get("authorization");

    let adminUserId: string | null = null;
    let schoolId: string | null = null;

    // Try to extract user info from JWT token for audit logging
    if (authHeader) {
      const jwtToken = JWTClientUtils.extractTokenFromHeader(authHeader);
      if (jwtToken) {
        try {
          const payload = await JWTUtils.verifyAuthToken(jwtToken);
          adminUserId = payload.adminId;
          schoolId = payload.schoolId;
        } catch (error) {
          // Token might be expired or invalid, but we still want to proceed with signout
          console.log("Could not verify JWT token during signout:", error);
        }
      }
    }

    // If we couldn't get user info from JWT, try from session
    if (!adminUserId && sessionToken) {
      try {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: {
            adminUser: {
              select: {
                id: true,
                schoolId: true,
              },
            },
          },
        });

        if (session?.adminUser) {
          adminUserId = session.adminUser.id;
          schoolId = session.adminUser.schoolId;
        }
      } catch (error) {
        console.log("Could not find session during signout:", error);
      }
    }

    // Clean up database sessions
    const cleanupPromises: Promise<void>[] = [];

    // Delete session if exists
    if (sessionToken) {
      cleanupPromises.push(
        prisma.session
          .deleteMany({
            where: { sessionToken },
          })
          .then(() => {})
      );
    }

    // Optional: Clean up expired sessions for this user
    if (adminUserId) {
      cleanupPromises.push(
        prisma.session
          .deleteMany({
            where: {
              adminUserId,
              expires: {
                lt: new Date(),
              },
            },
          })
          .then(() => {})
      );
    }

    // Execute cleanup operations
    await Promise.allSettled(cleanupPromises);

    // Clear cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      expires: new Date(0), // Expire immediately
    };

    cookieStore.set({
      name: "session-token",
      value: "",
      ...cookieOptions,
    });

    cookieStore.set({
      name: "refresh-token",
      value: "",
      ...cookieOptions,
    });

    // Also clear the public adminId cookie if it exists
    cookieStore.set({
      name: "adminId",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    // Log the signout action
    if (adminUserId) {
      try {
        await prisma.adminAuditLog.create({
          data: {
            adminUserId,
            schoolId: schoolId || undefined,
            action: "LOGOUT",
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
              request.headers.get("x-real-ip") ||
              "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
          },
        });
      } catch (error) {
        console.log("Could not log signout action:", error);
        // Don't fail the signout if audit logging fails
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Signout successful",
    });
  } catch (error) {
    console.error("Signout error:", error);

    // Even if there's an error, we should still try to clear cookies
    // to ensure the user is signed out on the client side
    try {
      const cookieStore = await cookies();
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
        expires: new Date(0),
      };

      cookieStore.set({
        name: "session-token",
        value: "",
        ...cookieOptions,
      });

      cookieStore.set({
        name: "refresh-token",
        value: "",
        ...cookieOptions,
      });

      cookieStore.set({
        name: "adminId",
        value: "",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      });
    } catch (cookieError) {
      console.error(
        "Could not clear cookies during error cleanup:",
        cookieError
      );
    }

    return NextResponse.json(
      {
        success: true, // Still return success to ensure client-side cleanup
        message: "Signout completed with cleanup errors",
      },
      { status: 200 }
    );
  }
}

// Optional: Handle GET requests for signout links
export async function GET(request: NextRequest) {
  // Redirect GET requests to POST for security
  return NextResponse.redirect(new URL("/login", request.url));
}
