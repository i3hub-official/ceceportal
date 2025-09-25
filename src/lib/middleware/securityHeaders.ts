// ========= Security Headers Middleware =========

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCspConfig } from "../security/cspConfig";

export function withSecurityHeaders(req: NextRequest) {
  const res = NextResponse.next();

  // Core Security Headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // ✅ Generate CSP safely (no eval/new Function)
  const cspConfig = getCspConfig() as Record<string, string[] | string>;
  const cspDirectives = Object.entries(cspConfig)
    .map(([key, values]) => {
      const directive = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      if (Array.isArray(values)) {
        return values.length > 0
          ? `${directive} ${values.join(" ")}`
          : directive;
      }

      if (typeof values === "string" && values.length > 0) {
        return `${directive} ${values}`;
      }

      return null;
    })
    .filter(Boolean)
    .join("; ");

  res.headers.set("Content-Security-Policy", cspDirectives);

  return res;
}

// ✅ Don’t block Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
