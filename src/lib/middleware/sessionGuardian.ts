// ========================================
// 🔐 ENHANCED SESSION GUARDIAN - Complete Session Security
// Responsibility: Protect against session hijacking with DB cleanup
// ========================================

// File: src/lib/middleware/sessionGuardian.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import type { MiddlewareContext } from "./types";

interface SessionFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  ipAddress: string;
  timestamp: number;
}

export class SessionGuardian {
  private static sessionFingerprints = new Map<string, SessionFingerprint>();

  static guard(request: NextRequest, context: MiddlewareContext): NextResponse {
    try {
      // Skip if no session
      if (!context.hasSession || !context.sessionToken) {
        return NextResponse.next();
      }

      // SECURITY CHECK: If session or refresh token is missing, clean everything
      if (!context.sessionToken || !context.refreshToken) {
        console.log(
          "[SESSION GUARDIAN] 🧹 Missing tokens - cleaning up session"
        );
        return this.cleanupAndInvalidateSession(
          context.sessionToken,
          context.refreshToken,
          "missing_tokens"
        );
      }

      // Create current fingerprint
      const currentFingerprint: SessionFingerprint = {
        userAgent: request.headers.get("user-agent") || "",
        acceptLanguage: request.headers.get("accept-language") || "",
        acceptEncoding: request.headers.get("accept-encoding") || "",
        ipAddress: context.clientIp,
        timestamp: Date.now(),
      };

      // Check existing fingerprint
      const storedFingerprint = this.sessionFingerprints.get(
        context.sessionToken
      );

      if (storedFingerprint) {
        const suspicionScore = this.calculateSuspicionScore(
          currentFingerprint,
          storedFingerprint
        );

        if (suspicionScore > 70) {
          console.log(
            `[SESSION GUARDIAN] ❌ Session hijacking suspected: ${suspicionScore}`
          );
          return this.cleanupAndInvalidateSession(
            context.sessionToken,
            context.refreshToken,
            "hijacking_suspected"
          );
        } else if (suspicionScore > 40) {
          console.log(
            `[SESSION GUARDIAN] ⚠️ Session anomaly detected: ${suspicionScore}`
          );
          // Update fingerprint but continue
          this.sessionFingerprints.set(
            context.sessionToken,
            currentFingerprint
          );
        }
      } else {
        // Store new fingerprint
        this.sessionFingerprints.set(context.sessionToken, currentFingerprint);
      }

      const response = NextResponse.next();
      response.headers.set("x-session-protected", "true");
      return response;
    } catch (error) {
      console.error("[SESSION GUARDIAN] Error in session protection:", error);

      // On any error, clean up the session for security
      return this.cleanupAndInvalidateSession(
        context.sessionToken,
        context.refreshToken,
        "guardian_error"
      );
    }
  }

  private static calculateSuspicionScore(
    current: SessionFingerprint,
    stored: SessionFingerprint
  ): number {
    let score = 0;

    // IP address change (most suspicious)
    if (current.ipAddress !== stored.ipAddress) {
      score += 50;
    }

    // User agent change
    if (current.userAgent !== stored.userAgent) {
      score += 30;
    }

    // Accept headers change
    if (current.acceptLanguage !== stored.acceptLanguage) {
      score += 10;
    }

    if (current.acceptEncoding !== stored.acceptEncoding) {
      score += 5;
    }

    return score;
  }

  private static cleanupAndInvalidateSession(
    sessionToken?: string,
    refreshToken?: string,
    reason: string = "security_violation"
  ): NextResponse {
    // Clean up in-memory fingerprints
    if (sessionToken) {
      this.sessionFingerprints.delete(sessionToken);
    }
    if (refreshToken) {
      this.sessionFingerprints.delete(refreshToken);
    }

    // Clean up database (async but don't wait)
    this.cleanupDatabaseSession(sessionToken, refreshToken, reason);

    // Create redirect response
    const response = NextResponse.redirect(
      new URL(`/login`, "https://192.168.0.159:3002")
    );

    // Clear all session-related cookies
    const cookiesToClear = [
      "session-token",
      "refresh-token",
      "auth-token",
      "csrf-token",
    ];

    cookiesToClear.forEach((cookieName) => {
      response.cookies.set({
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    });

    // Add security headers
    response.headers.set("x-session-invalidated", "true");
    response.headers.set("x-invalidation-reason", reason);

    console.log(`[SESSION GUARDIAN] 🧹 Session invalidated: ${reason}`);

    return response;
  }

  private static async cleanupDatabaseSession(
    sessionToken?: string,
    refreshToken?: string,
    reason: string = "cleanup"
  ): Promise<void> {
    try {
      // Find and delete session by sessionToken
      if (sessionToken) {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { adminUser: true },
        });

        if (session) {
          // Log security event
          await prisma.adminAuditLog.create({
            data: {
              adminUserId: session.adminUserId,
              action: "SESSION_INVALIDATED",
              details: `Reason: ${reason}`,
              ipAddress: "middleware",
              userAgent: "SessionGuardian",
            },
          });

          // Delete the session
          await prisma.session.delete({
            where: { sessionToken },
          });

          console.log(
            `[SESSION GUARDIAN] 🗑️ DB session deleted for token: ${sessionToken.substring(0, 8)}...`
          );
        }
      }

      // Also clean up any expired sessions while we're at it
      const deletedExpired = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });

      if (deletedExpired.count > 0) {
        console.log(
          `[SESSION GUARDIAN] 🧹 Cleaned up ${deletedExpired.count} expired sessions`
        );
      }
    } catch (error) {
      console.error(
        "[SESSION GUARDIAN] Error cleaning database session:",
        error
      );
      // Don't throw - this is a cleanup operation
    }
  }

  // Public method for manual session cleanup (useful for logout)
  static async forceCleanupSession(
    sessionToken: string,
    reason: string = "manual_logout"
  ): Promise<void> {
    // Clean memory
    this.sessionFingerprints.delete(sessionToken);

    // Clean database
    await this.cleanupDatabaseSession(sessionToken, undefined, reason);
  }

  // Health check method
  static getSessionStats(): {
    activeFingerprints: number;
    oldestFingerprint: number | null;
    newestFingerprint: number | null;
  } {
    const fingerprints = Array.from(this.sessionFingerprints.values());
    const timestamps = fingerprints.map((fp) => fp.timestamp);

    return {
      activeFingerprints: fingerprints.length,
      oldestFingerprint: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestFingerprint: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  // Periodic cleanup method (call this from a cron job or similar)
  static cleanupOldFingerprints(maxAgeHours: number = 24): void {
    const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;
    let cleaned = 0;

    for (const [token, fingerprint] of this.sessionFingerprints.entries()) {
      if (fingerprint.timestamp < cutoffTime) {
        this.sessionFingerprints.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(
        `[SESSION GUARDIAN] 🧹 Cleaned up ${cleaned} old fingerprints`
      );
    }
  }
}
