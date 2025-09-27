
// ========================================
// 🎭 FINAL ORCHESTRATOR - All 13 Middleware Components
// ========================================

// File: src/lib/middleware/orchestrator.ts (Final Update)
import { NextRequest, NextResponse } from "next/server";
import { ContextBuilder } from "./contextBuilder";
import { SecurityGuard } from "./securityGuard";
import { GeoGuard } from "./geoGuard";
import { ThreatDetector } from "./threatDetector"; // NEW
import { RequestTransformer } from "./requestTransformer";
import { CacheManager } from "./cacheManager"; // NEW
import { SessionGuardian } from "./sessionGuardian"; // NEW
import { EnhancedRateEnforcer } from "./enhancedRateEnforcer";
import { ActivityLogger } from "./activityLogger";
import { AccessController } from "./accessController";
import { ApiAccessGuardian } from "./apiAccessGuardian";
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

      // TASK 9: Geographic access control
      const geoResponse = await GeoGuard.guard(request, context);
      if (geoResponse.status === 403) {
        return ResponseMerger.merge(geoResponse, response);
      }
      response = ResponseMerger.merge(response, geoResponse);

      // TASK 12: Advanced threat detection (NEW)
      const threatResponse = await ThreatDetector.detect(request, context);
      if (threatResponse.status === 403) {
        return ResponseMerger.merge(threatResponse, response);
      }
      response = ResponseMerger.merge(response, threatResponse);

      // TASK 13: Session security (NEW)
      const sessionResponse = SessionGuardian.guard(request, context);
      if (sessionResponse.redirected) {
        return ResponseMerger.merge(sessionResponse, response);
      }
      response = ResponseMerger.merge(response, sessionResponse);

      // TASK 10: Transform and sanitize request
      const transformResponse = RequestTransformer.transform(request, context);
      if (transformResponse.status === 400) {
        return ResponseMerger.merge(transformResponse, response);
      }
      response = ResponseMerger.merge(response, transformResponse);

      // TASK 11: Cache management (NEW) - Check cache before expensive operations
      const cacheResponse = await CacheManager.manage(request, context);
      if (cacheResponse.headers.get("x-cache") === "HIT" || cacheResponse.status === 304) {
        return ResponseMerger.merge(cacheResponse, response);
      }
      response = ResponseMerger.merge(response, cacheResponse);

      // TASK 8: API Access Guardian (JWT validation for API paths)
      if (ApiAccessGuardian.isApiPath(request.nextUrl.pathname)) {
        const apiResponse = await ApiAccessGuardian.guard(request, context);
        if (apiResponse.status !== 200) {
          return ResponseMerger.merge(apiResponse, response);
        }
        response = ResponseMerger.merge(response, apiResponse);
      }

      // TASK 3: Enhanced rate limiting (considers threat level)
      const rateLimitResponse = await EnhancedRateEnforcer.enforce(request, context);
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

      console.log(`[ORCHESTRATOR] ✅ All 13 middleware tasks completed in ${processingTime}ms`);
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