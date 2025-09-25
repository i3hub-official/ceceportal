// File: src/lib/middleware/withSession.ts
import { NextRequest, NextResponse } from "next/server";
import { isPrivatePath } from "@/lib/utils/auth-paths";

const SESSION_COOKIE = "session-token";
const AGENT_COOKIE = "agent-id";
const SESSION_EXPIRY_HOURS = 6;

export async function withSession(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // If no token and accessing a private path → redirect to login
  if (!token && isPrivatePath(request.nextUrl.pathname)) {
    console.log(
      `[Middleware] No session token, redirecting to login: ${request.nextUrl.pathname}`
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Token exists → refresh cookies locally without DB validation
  if (token) {
    const res = NextResponse.next();
    const secure = process.env.NODE_ENV === "production";

    // Refresh HttpOnly session cookie
    res.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
    });

    // Refresh public agent-id cookie (if exists)
    const agentId = request.cookies.get(AGENT_COOKIE)?.value;
    if (agentId) {
      res.cookies.set({
        name: AGENT_COOKIE,
        value: agentId,
        httpOnly: false,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_EXPIRY_HOURS * 60 * 60,
      });
    }

    console.log(`[Middleware] Session token present, cookies refreshed.`);
    return res;
  }

  // No token and path is public → allow
  console.log(
    `[Middleware] Public path, no session needed: ${request.nextUrl.pathname}`
  );
  return NextResponse.next();
}
