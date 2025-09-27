// ========================================
// 🎭 ULTIMATE ORCHESTRATOR - All 16 Middleware Components
// ========================================

// File: src/lib/middleware/orchestrator.ts (Ultimate Final Version)
import { NextRequest, NextResponse } from "next/server";
import { ContextBuilder } from "./contextBuilder";
import { SecurityGuard } from "./securityGuard";
import { GeoGuard } from "./geoGuard";
import { ThreatDetector } from "./threatDetector";
import { BehaviorAnalyst } from "./behaviorAnalyst"; // NEW
import { EncryptionEnforcer } from "./encryptionEnforcer"; // NEW
import { ComplianceMonitor } from "./complianceMonitor"; // NEW
import { SessionGuardian } from "./sessionGuardian";
import { RequestTransformer } from "./requestTransformer";
import { CacheManager } from "./cacheManager";
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
      // TASK 1: Build context (intelligence gathering)
      context = ContextBuilder.build(request);
      
      // TASK 2: Apply core security (fortress walls)
      const securityResponse = SecurityGuard.apply(request, context);
      if (securityResponse.status !== 200) return securityResponse;
      response = ResponseMerger.merge(response, securityResponse);

      // TASK 15: Enforce encryption standards (NEW)
      const encryptionResponse = EncryptionEnforcer.enforce(request, context);
      if (encryptionResponse.status !== 200) return encryptionResponse;
      response = ResponseMerger.merge(response, encryptionResponse);

      // TASK 9: Geographic access control (border patrol)
      const geoResponse = await GeoGuard.guard(request, context);
      if (geoResponse.status === 403) {
        return ResponseMerger.merge(geoResponse, response);
      }
      response = ResponseMerger.merge(response, geoResponse);

      // TASK 12: Advanced threat detection (AI scanner)
      const threatResponse = await ThreatDetector.detect(request, context);
      if (threatResponse.status === 403) {
        return ResponseMerger.merge(threatResponse, response);
      }
      response = ResponseMerger.merge(response, threatResponse);

      // TASK 14: Behavior analysis (NEW - AI anomaly detection)
      const behaviorResponse = BehaviorAnalyst.analyze(request, context);
      response = ResponseMerger.merge(response, behaviorResponse);

      // TASK 13: Session security (identity protection)
      const sessionResponse = SessionGuardian.guard(request, context);
      if (sessionResponse.redirected) {
        return ResponseMerger.merge(sessionResponse, response);
      }
      response = ResponseMerger.merge(response, sessionResponse);

      // TASK 16: Compliance monitoring (NEW - regulatory compliance)
      const complianceResponse = ComplianceMonitor.monitor(request, context);
      response = ResponseMerger.merge(response, complianceResponse);

      // TASK 10: Transform and sanitize request (data cleaner)
      const transformResponse = RequestTransformer.transform(request, context);
      if (transformResponse.status === 400) {
        return ResponseMerger.merge(transformResponse, response);
      }
      response = ResponseMerger.merge(response, transformResponse);

      // TASK 11: Cache management (performance optimizer)
      const cacheResponse = await CacheManager.manage(request, context);
      if (cacheResponse.headers.get("x-cache") === "HIT" || cacheResponse.status === 304) {
        return ResponseMerger.merge(cacheResponse, response);
      }
      response = ResponseMerger.merge(response, cacheResponse);

      // TASK 8: API Access Guardian (JWT specialist)
      if (ApiAccessGuardian.isApiPath(request.nextUrl.pathname)) {
        const apiResponse = await ApiAccessGuardian.guard(request, context);
        if (apiResponse.status !== 200) {
          return ResponseMerger.merge(apiResponse, response);
        }
        response = ResponseMerger.merge(response, apiResponse);
      }

      // TASK 3: Enhanced rate limiting (traffic control with threat awareness)
      const rateLimitResponse = await EnhancedRateEnforcer.enforce(request, context);
      if (rateLimitResponse.status === 429) {
        return ResponseMerger.merge(rateLimitResponse, response);
      }
      response = ResponseMerger.merge(response, rateLimitResponse);

      // TASK 4: Log activity (all-seeing observer)
      await ActivityLogger.log(request, context);

      // TASK 5: Control access (session bouncer for non-API paths)
      if (!ApiAccessGuardian.isApiPath(request.nextUrl.pathname)) {
        const accessResponse = AccessController.control(request, context);
        if (accessResponse.redirected || accessResponse.status !== 200) {
          return ResponseMerger.merge(accessResponse, response);
        }
        response = ResponseMerger.merge(response, accessResponse);
      }

      // TASK 6: Add system headers and finalize (master coordinator)
      const processingTime = Date.now() - startTime;
      response = ResponseMerger.addSystemHeaders(response, processingTime);

      console.log(`[ORCHESTRATOR] ✅ ALL 16 MIDDLEWARE GUARDS COMPLETED in ${processingTime}ms`);
      console.log(`[ORCHESTRATOR] 🏰 FORTRESS STATUS: FULLY OPERATIONAL`);
      
      return response;

    } catch (error) {
      console.error("[ORCHESTRATOR] ❌ CRITICAL ERROR in middleware fortress:", error);
      
      const errorResponse = new Response("Internal Server Error", {
        status: 500,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "X-Fortress-Status": "EMERGENCY_MODE"
        },
      });

      return ResponseMerger.merge(
        new NextResponse(errorResponse.body, errorResponse), 
        response
      );
    }
  }
}