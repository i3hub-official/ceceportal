// ========================================
// 🔧 CORE UTILITIES - Foundation Layer
// ========================================

// File: src/lib/middleware/types.ts
import { NextRequest, NextResponse } from "next/server";

export interface MiddlewareContext {
  isPublicPath: boolean;
  isAuthPath: boolean;
  isPrivatePath: boolean;
  hasSession: boolean;
  sessionToken?: string;
  agentId?: string;
  clientIp: string;
  userAgent: string;
  timestamp: number;
}

export type MiddlewareFunction = (
  request: NextRequest,
  context: MiddlewareContext
) => Promise<NextResponse> | NextResponse;

export type MiddlewareResult = {
  response: NextResponse;
  shouldContinue: boolean;
  context: Partial<MiddlewareContext>;
};
