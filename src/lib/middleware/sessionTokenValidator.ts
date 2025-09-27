// ========================================
// 🎫 TASK 17: SESSION TOKEN VALIDATOR - Automatic Session Management
// Responsibility: Validate sessions, refresh tokens, auto login/logout
// ========================================

// File: src/lib/middleware/sessionTokenValidator.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { JWTUtils, JWTClientUtils } from "@/lib/server/jwt";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import type { MiddlewareContext } from "./types";

interface SessionValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  shouldLogout: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolId?: string;
    centerNumber?: string;
  };
  action: 'continue' | 'refresh' | 'logout' | 'redirect_login';
}

export class SessionTokenValidator {
  private static readonly SESSION_EXPIRY_HOURS = 8;
  private static readonly REFRESH_THRESHOLD_HOURS = 2; // Refresh if less than 2 hours left
  private static readonly MAX_SESSION_AGE_DAYS = 7;

  static async validate(request: NextRequest, context: MiddlewareContext): Promise<NextResponse> {
    try {
      const validationResult = await this.validateSession(request, context);
      
      switch (validationResult.action) {
        case 'logout':
          return this.performLogout(request, validationResult);
          
        case 'refresh':
          return await this.performTokenRefresh(request, validationResult);
          
        case 'redirect_login':
          return this.redirectToLogin(request);
          
        case 'continue':
        default:
          return this.continueWithSession(request, validationResult);
      }

    } catch (error) {
      console.error('[SESSION VALIDATOR] Error validating session:', error);
      return this.handleValidationError(request);
    }
  }

  private static async validateSession(request: NextRequest, context: MiddlewareContext): Promise<SessionValidationResult> {
    const sessionToken = request.cookies.get("session-token")?.value;
    const refreshToken = request.cookies.get("refresh-token")?.value;
    const authToken = request.headers.get("authorization");

    // No tokens present
    if (!sessionToken && !refreshToken && !authToken) {
      return {
        isValid: false,
        needsRefresh: false,
        shouldLogout: false,
        action: context.isPrivatePath ? 'redirect_login' : 'continue'
      };
    }

    // Validate session token first
    if (sessionToken) {
      const sessionResult = await this.validateSessionToken(sessionToken);
      if (sessionResult.isValid) {
        // Check if session needs refresh
        if (sessionResult.needsRefresh) {
          return { ...sessionResult, action: 'refresh' };
        }
        return { ...sessionResult, action: 'continue' };
      }
    }

    // Session token invalid, try refresh token
    if (refreshToken) {
      const refreshResult = await this.validateRefreshToken(refreshToken);
      if (refreshResult.isValid) {
        return { ...refreshResult, action: 'refresh' };
      }
    }

    // Try JWT auth token (for API requests)
    if (authToken) {
      const jwtResult = await this.validateAuthToken(authToken);
      if (jwtResult.isValid) {
        return { ...jwtResult, action: 'continue' };
      }
    }

    // All tokens invalid - logout required
    return {
      isValid: false,
      needsRefresh: false,
      shouldLogout: true,
      action: 'logout'
    };
  }

  private static async validateSessionToken(sessionToken: string): Promise<SessionValidationResult> {
    try {
      // Find session in database
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          adminUser: {
            include: {
              school: {
                select: { centerNumber: true }
              }
            }
          }
        }
      });

      if (!session) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      // Check if session expired
      if (session.expires < new Date()) {
        // Clean up expired session
        await prisma.session.delete({ where: { id: session.id } });
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      // Check if user is still active
      if (!session.adminUser.isActive) {
        await prisma.session.delete({ where: { id: session.id } });
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      // Check if session is too old
      const sessionAge = Date.now() - session.createdAt.getTime();
      const maxAge = this.MAX_SESSION_AGE_DAYS * 24 * 60 * 60 * 1000;
      if (sessionAge > maxAge) {
        await prisma.session.delete({ where: { id: session.id } });
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      // Check if session needs refresh (less than 2 hours left)
      const timeLeft = session.expires.getTime() - Date.now();
      const refreshThreshold = this.REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000;
      const needsRefresh = timeLeft < refreshThreshold;

      return {
        isValid: true,
        needsRefresh,
        shouldLogout: false,
        user: {
          id: session.adminUser.id,
          name: session.adminUser.name,
          email: session.adminUser.email,
          role: session.adminUser.role,
          schoolId: session.adminUser.schoolId || undefined,
          centerNumber: session.adminUser.school?.centerNumber || undefined,
        },
        action: needsRefresh ? 'refresh' : 'continue'
      };

    } catch (error) {
      console.error('[SESSION VALIDATOR] Error validating session token:', error);
      return {
        isValid: false,
        needsRefresh: false,
        shouldLogout: true,
        action: 'logout'
      };
    }
  }

  private static async validateRefreshToken(refreshToken: string): Promise<SessionValidationResult> {
    try {
      // Verify refresh token JWT
      const payload = await JWTUtils.verifyToken(refreshToken);
      
      if (payload.type !== 'refresh' || !payload.adminId) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      // Find user
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: payload.adminId as string },
        include: {
          school: {
            select: { centerNumber: true }
          }
        }
      });

      if (!adminUser || !adminUser.isActive) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      return {
        isValid: true,
        needsRefresh: true,
        shouldLogout: false,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          schoolId: adminUser.schoolId || undefined,
          centerNumber: adminUser.school?.centerNumber || undefined,
        },
        action: 'refresh'
      };

    } catch (error) {
      console.error('[SESSION VALIDATOR] Error validating refresh token:', error);
      return {
        isValid: false,
        needsRefresh: false,
        shouldLogout: true,
        action: 'logout'
      };
    }
  }

  private static async validateAuthToken(authHeader: string): Promise<SessionValidationResult> {
    try {
      const token = JWTClientUtils.extractTokenFromHeader(authHeader);
      if (!token) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: false,
          action: 'continue'
        };
      }

      // Verify auth token
      const payload = await JWTUtils.verifyAuthToken(token);
      
      // Find user to ensure they're still active
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: payload.adminId },
        include: {
          school: {
            select: { centerNumber: true }
          }
        }
      });

      if (!adminUser || !adminUser.isActive) {
        return {
          isValid: false,
          needsRefresh: false,
          shouldLogout: true,
          action: 'logout'
        };
      }

      return {
        isValid: true,
        needsRefresh: false,
        shouldLogout: false,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          schoolId: adminUser.schoolId || undefined,
          centerNumber: adminUser.school?.centerNumber || undefined,
        },
        action: 'continue'
      };

    } catch (error) {
      // JWT verification failed - not necessarily an error for API tokens
      return {
        isValid: false,
        needsRefresh: false,
        shouldLogout: false,
        action: 'continue'
      };
    }
  }

  private static async performTokenRefresh(request: NextRequest, validationResult: SessionValidationResult): Promise<NextResponse> {
    try {
      if (!validationResult.user) {
        return this.performLogout(request, validationResult);
      }

      const user = validationResult.user;

      // Generate new tokens
      const newSessionToken = nanoid();
      const newRefreshToken = await JWTUtils.generateRefreshToken(user.id);
      const newAuthToken = await JWTUtils.generateAuthToken({
        adminId: user.id,
        email: user.email,
        schoolId: user.schoolId || "",
        role: user.role,
        centerNumber: user.centerNumber || "",
      });

      // Update session in database
      const expires = new Date();
      expires.setHours(expires.getHours() + this.SESSION_EXPIRY_HOURS);

      await prisma.session.upsert({
        where: { 
          sessionToken: request.cookies.get("session-token")?.value || newSessionToken 
        },
        update: {
          sessionToken: newSessionToken,
          expires,
        },
        create: {
          sessionToken: newSessionToken,
          adminUserId: user.id,
          expires,
        }
      });

      // Update last login
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Log refresh action
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          schoolId: user.schoolId,
          action: "SESSION_REFRESHED",
          details: {
            automatic: true,
            userAgent: request.headers.get("user-agent"),
          },
          ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      // Create response with new cookies
      const response = NextResponse.next();
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
      };

      response.cookies.set({
        name: "session-token",
        value: newSessionToken,
        expires,
        ...cookieOptions,
      });

      response.cookies.set({
        name: "refresh-token",
        value: newRefreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ...cookieOptions,
      });

      // Add user info to response headers for other middleware
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", user.role);
      response.headers.set("x-session-refreshed", "true");
      response.headers.set("x-auth-token", newAuthToken);

      console.log(`[SESSION VALIDATOR] ✅ Session refreshed for user: ${user.id}`);
      return response;

    } catch (error) {
      console.error('[SESSION VALIDATOR] Error refreshing tokens:', error);
      return this.performLogout(request, validationResult);
    }
  }

  private static performLogout(request: NextRequest, validationResult: SessionValidationResult): NextResponse {
    console.log('[SESSION VALIDATOR] 🚪 Performing automatic logout');

    // Clean up database session (async, don't wait)
    const sessionToken = request.cookies.get("session-token")?.value;
    if (sessionToken) {
      this.cleanupSession(sessionToken).catch(error => 
        console.error('[SESSION VALIDATOR] Error cleaning up session:', error)
      );
    }

    const response = NextResponse.redirect(new URL("/login?reason=session_expired", request.url));
    
    // Clear all session cookies
    const cookiesToClear = ["session-token", "refresh-token", "auth-token"];
    const cookieOptions = {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: "",
        ...cookieOptions,
      });
    });

    response.headers.set("x-session-invalidated", "true");
    response.headers.set("x-logout-reason", "automatic");

    return response;
  }

  private static redirectToLogin(request: NextRequest): NextResponse {
    console.log('[SESSION VALIDATOR] 🔄 Redirecting to login');
    
    const loginUrl = new URL("/login", request.url);
    if (request.nextUrl.pathname !== "/login") {
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  private static continueWithSession(request: NextRequest, validationResult: SessionValidationResult): NextResponse {
    const response = NextResponse.next();
    
    if (validationResult.user) {
      // Add user info to headers for other middleware
      response.headers.set("x-user-id", validationResult.user.id);
      response.headers.set("x-user-role", validationResult.user.role);
      response.headers.set("x-user-school", validationResult.user.schoolId || "");
      response.headers.set("x-session-valid", "true");
    }

    return response;
  }

  private static handleValidationError(request: NextRequest): NextResponse {
    console.log('[SESSION VALIDATOR] ⚠️ Validation error, redirecting to login');
    
    const response = NextResponse.redirect(new URL("/login?reason=validation_error", request.url));
    
    // Clear potentially corrupted cookies
    const cookiesToClear = ["session-token", "refresh-token"];
    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: "",
        expires: new Date(0),
        path: "/",
      });
    });

    return response;
  }

  private static async cleanupSession(sessionToken: string): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { adminUser: true }
      });

      if (session) {
        await prisma.adminAuditLog.create({
          data: {
            adminUserId: session.adminUserId,
            schoolId: session.adminUser.schoolId,
            action: "SESSION_CLEANED_UP",
            details: { automatic: true },
            ipAddress: "middleware",
            userAgent: "SessionTokenValidator",
          },
        });

        await prisma.session.delete({
          where: { sessionToken }
        });
      }

      // Clean up expired sessions while we're here
      await prisma.session.deleteMany({
        where: {
          expires: { lt: new Date() }
        }
      });

    } catch (error) {
      console.error('[SESSION VALIDATOR] Error in cleanup:', error);
    }
  }

  // Public method for manual session validation (useful for API routes)
  static async validateSessionManually(sessionToken: string): Promise<SessionValidationResult> {
    return this.validateSessionToken(sessionToken);
  }

  // Public method to get session statistics
  static async getSessionStats(): Promise<{
    totalActiveSessions: number;
    expiredSessions: number;
    oldSessions: number;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalActive, expired, old] = await Promise.all([
      prisma.session.count({
        where: {
          expires: { gt: now }
        }
      }),
      prisma.session.count({
        where: {
          expires: { lte: now }
        }
      }),
      prisma.session.count({
        where: {
          createdAt: { lte: sevenDaysAgo }
        }
      })
    ]);

    return {
      totalActiveSessions: totalActive,
      expiredSessions: expired,
      oldSessions: old
    };
  }
}
