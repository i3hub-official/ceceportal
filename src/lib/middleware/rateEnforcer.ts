// ========================================
// 🚦 TASK 3: RATE ENFORCER - Traffic Controller
// Responsibility: Enforce rate limits per IP/user
// ========================================

// File: src/lib/middleware/rateEnforcer.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/rateLimit";
import type { MiddlewareContext } from "./types";

interface RateLimitConfig {
  interval: number;
  limit: number;
  namespace?: string;
}

export class RateEnforcer {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    interval: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    namespace: "global",
  };

  private static readonly PATH_CONFIGS: Record<string, RateLimitConfig> = {
    "/api/auth/login": {
      interval: 15 * 60 * 1000,
      limit: 5,
      namespace: "login",
    },
    "/api/auth/signup": {
      interval: 60 * 60 * 1000,
      limit: 3,
      namespace: "signup",
    },
    "/api/auth/forgot-password": {
      interval: 60 * 60 * 1000,
      limit: 3,
      namespace: "forgot",
    },
  };

  static async enforce(
    request: NextRequest,
    context: MiddlewareContext
  ): Promise<NextResponse> {
    const pathname = request.nextUrl.pathname;
    const config = this.PATH_CONFIGS[pathname] || this.DEFAULT_CONFIG;

    const { success, limit, remaining, reset } = await rateLimit({
      interval: config.interval,
      limit: config.limit,
      uniqueId: context.clientIp,
      namespace: config.namespace || "ip",
    });

    const response = success
      ? NextResponse.next()
      : new NextResponse("Too many requests", {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        });

    // Add rate limit headers
    this.addRateLimitHeaders(response, {
      limit,
      remaining,
      reset,
      used: limit - remaining,
    });

    return response;
  }

  private static addRateLimitHeaders(
    response: NextResponse,
    info: { limit: number; remaining: number; reset: number; used: number }
  ): void {
    const headers = {
      "X-RateLimit-Limit": info.limit.toString(),
      "X-RateLimit-Remaining": info.remaining.toString(),
      "X-RateLimit-Reset": new Date(info.reset).toISOString(),
      "X-RateLimit-Used": info.used.toString(),
    };

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}
