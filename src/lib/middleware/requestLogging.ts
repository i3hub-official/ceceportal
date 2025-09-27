// File: src/lib/middleware/requestLogging.ts
import type { NextRequest } from "next/server";

export async function withRequestLogging(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    if (request.nextUrl.search) {
      // console.log('Query parameters:', request.nextUrl.searchParams.toString());
    }
    // Log request body if it's a POST or PUT request
    if (["POST", "PUT"].includes(request.method)) {
      // const body = await request.text();
      // console.log('Request body:', body);
    }
  }
}
