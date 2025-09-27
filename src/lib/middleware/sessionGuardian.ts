// ========================================
// 🔐 TASK 13: SESSION GUARDIAN - Advanced Session Security
// Responsibility: Protect against session hijacking and fixation
// ========================================

// File: src/lib/middleware/sessionGuardian.ts
import { NextRequest, NextResponse } from "next/server";
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

      // Create current fingerprint
      const currentFingerprint: SessionFingerprint = {
        userAgent: request.headers.get("user-agent") || "",
        acceptLanguage: request.headers.get("accept-language") || "",
        acceptEncoding: request.headers.get("accept-encoding") || "",
        ipAddress: context.clientIp,
        timestamp: Date.now(),
      };

      // Check existing fingerprint
      const storedFingerprint = this.sessionFingerprints.get(context.sessionToken);
      
      if (storedFingerprint) {
        const suspicionScore = this.calculateSuspicionScore(currentFingerprint, storedFingerprint);
        
        if (suspicionScore > 70) {
          console.log(`[SESSION GUARDIAN] ❌ Session hijacking suspected: ${suspicionScore}`);
          return this.invalidateSession(context.sessionToken);
        } else if (suspicionScore > 40) {
          console.log(`[SESSION GUARDIAN] ⚠️ Session anomaly detected: ${suspicionScore}`);
          // Update fingerprint but continue
          this.sessionFingerprints.set(context.sessionToken, currentFingerprint);
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
      return NextResponse.next();
    }
  }

  private static calculateSuspicionScore(current: SessionFingerprint, stored: SessionFingerprint): number {
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

  private static invalidateSession(sessionToken: string): NextResponse {
    // Remove fingerprint
    this.sessionFingerprints.delete(sessionToken);

    const response = NextResponse.redirect(new URL("/login?reason=session_expired", "https://192.168.0.159:3002"));
    
    // Clear session cookie
    response.cookies.set({
      name: "session-token",
      value: "",
      expires: new Date(0),
    });

    return response;
  }
}
