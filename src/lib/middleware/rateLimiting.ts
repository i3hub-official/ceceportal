// File: src/lib/middleware/rateLimiting.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/middleware/rateLimit";

const DEFAULT_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DEFAULT_LIMIT = 100;

export async function withRateLimiter(
  request: NextRequest,
  options?: { interval?: number; limit?: number }
): Promise<NextResponse> {
  const ip = request.headers.get("x-real-ip") || "192.168.0.159"; // Fallback IP for local testing

  const { success, limit, remaining, reset } = await rateLimit({
    interval: options?.interval || DEFAULT_INTERVAL,
    limit: options?.limit || DEFAULT_LIMIT,
    uniqueId: ip,
    namespace: "ip",
  });

  const response = success
    ? NextResponse.next()
    : new NextResponse("Too many requests", { status: 429 });

  // Set rate-limit headers
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());
  response.headers.set("X-RateLimit-Used", (limit - remaining).toString());
  response.headers.set(
    "X-RateLimit-Policy",
    `${DEFAULT_INTERVAL / 60000} minutes`
  );
  response.headers.set("X-RateLimit-Bypass", success ? "false" : "true");
  response.headers.set("X-RateLimit-Client-IP", ip);

  return response;
}
