// File: src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { chainMiddlewares } from "@/lib/middleware/middlewareChain";
import { withSecurityHeaders } from "./lib/middleware/securityHeaders";
import { withRequestLogging } from "@/lib/middleware/requestLogging";
import { withRateLimiter } from "@/lib/middleware/rateLimiting";
import { withAuthRedirect } from "@/lib/middleware/withAuthRedirect";
import { withSession } from "@/lib/middleware/withSession";
import { withPublicPaths } from "@/lib/middleware/withPublicPaths";
import { withCors } from "@/lib/middleware/withCors";

// ========= Matcher Config =========
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|health).*)",
  ],
};

// ========= Middleware Chain =========

export async function middleware(request: NextRequest): Promise<Response> {
  try {
    return await chainMiddlewares(request, [
      withCors,
      withSecurityHeaders,
      async (req) => {
        await withRequestLogging(req);
        return NextResponse.next();
      },
      withRateLimiter,
      withPublicPaths,
      withAuthRedirect, // logged-in users can’t see login/signup
      withSession, // blocks private paths if no valid session
    ]);
  } catch (error) {
    console.error("Middleware chain error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
