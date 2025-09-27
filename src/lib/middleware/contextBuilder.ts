// ========================================
// 🎯 TASK 1: CONTEXT BUILDER - Data Gatherer
// Responsibility: Collect and analyze request data
// ========================================

// File: src/lib/middleware/contextBuilder.ts
import { NextRequest, NextResponse } from "next/server";
import {
  isPublicPath,
  isAuthPath,
  isPrivatePath,
} from "@/lib/utils/auth-paths";
import { getClientIp } from "@/lib/utils/client-ip";
import type { MiddlewareContext } from "./types";

export class ContextBuilder {
  static build(request: NextRequest): MiddlewareContext {
    const pathname = request.nextUrl.pathname;
    const sessionToken = request.cookies.get("session-token")?.value;
    const refreshToken = request.cookies.get("refresh-token")?.value; // Add this
    const agentId = request.cookies.get("adminId")?.value;

    return {
      isPublicPath: isPublicPath(pathname),
      isAuthPath: isAuthPath(pathname),
      isPrivatePath: isPrivatePath(pathname),
      hasSession: !!sessionToken,
      sessionToken,
      refreshToken, // Add this
      agentId,
      clientIp: getClientIp(request) || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: Date.now(),
    };
  }
}
