// File: src/lib/middleware/withPublicPaths.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPublicPath } from "@/lib/utils/auth-paths";

export async function withPublicPaths(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  if (isPublicPath(pathname)) {
    response.headers.set("x-public-path", "true");
  }

  return response;
}
