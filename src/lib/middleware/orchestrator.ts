// ========================================
// 🎭 TASK 7: ORCHESTRATOR - Conductor
// Responsibility: Coordinate all middleware tasks
// ========================================

// File: src/lib/middleware/orchestrator.ts
import { NextRequest, NextResponse } from "next/server";
import { ContextBuilder } from "./contextBuilder";
import { SecurityGuard } from "./securityGuard";
import { EnhancedRateEnforcer } from "./enhancedRateEnforcer"; // Updated import
import { ActivityLogger } from "./activityLogger";
import { AccessController } from "./accessController";
import { ApiAccessGuardian } from "./apiAccessGuardian"; // New import
import { ResponseMerger } from "./responseMerger";
import type { MiddlewareContext } from "./types";

export class Orchestrator {
  static async execute(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let context: MiddlewareContext;
    let response = NextResponse.next();

    try {
      // TASK 1: Build context (data gathering)
      context = ContextBuilder.build(request);

      // TASK 2: Apply security (first line of defense)
      const securityResponse = SecurityGuard.apply(request, context);
      if (securityResponse.status !== 200) return securityResponse;
      response = ResponseMerger.merge(response, securityResponse);

      // TASK 8: API Access Guardian (NEW - JWT validation for API paths)
      if (ApiAccessGuardian.isApiPath(request.nextUrl.pathname)) {
        const apiResponse = await ApiAccessGuardian.guard(request, context);
        if (apiResponse.status !== 200) {
          return ResponseMerger.merge(apiResponse, response);
        }
        response = ResponseMerger.merge(response, apiResponse);
      }

      // TASK 3: Enhanced rate limiting (updated for API clients)
      const rateLimitResponse = await EnhancedRateEnforcer.enforce(
        request,
        context
      );
      if (rateLimitResponse.status === 429) {
        return ResponseMerger.merge(rateLimitResponse, response);
      }
      response = ResponseMerger.merge(response, rateLimitResponse);

      // TASK 4: Log activity (observation)
      await ActivityLogger.log(request, context);

      // TASK 5: Control access (only for non-API paths)
      if (!ApiAccessGuardian.isApiPath(request.nextUrl.pathname)) {
        const accessResponse = AccessController.control(request, context);
        if (accessResponse.redirected || accessResponse.status !== 200) {
          return ResponseMerger.merge(accessResponse, response);
        }
        response = ResponseMerger.merge(response, accessResponse);
      }

      // TASK 6: Add system headers and finalize
      const processingTime = Date.now() - startTime;
      response = ResponseMerger.addSystemHeaders(response, processingTime);

      console.log(
        `[ORCHESTRATOR] ✅ Request processed successfully in ${processingTime}ms`
      );
      return response;
    } catch (error) {
      console.error("[ORCHESTRATOR] ❌ Error in middleware chain:", error);

      const errorResponse = new Response("Internal Server Error", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });

      return ResponseMerger.merge(
        new NextResponse(errorResponse.body, errorResponse),
        response
      );
    }
  }
}
