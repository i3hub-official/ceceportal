

// ========================================
// 🎯 MAIN MIDDLEWARE - Entry Point
// ========================================

// File: src/middleware.ts
import { NextRequest } from "next/server";
import "./registry";
import { Orchestrator } from "@/lib/middleware/orchestrator";

// Matcher Config - Define what gets processed
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|health).*)",
  ],
};

// Main Middleware Function
export async function middleware(request: NextRequest) {
  return await Orchestrator.execute(request);
}