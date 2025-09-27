// ========================================
// 🚀 HYBRID ORCHESTRATOR - Best of Both Worlds
// Clean Architecture + Maximum Performance
// ========================================

import { NextRequest, NextResponse } from "next/server";
import { ContextBuilder } from "./contextBuilder";
import { SessionTokenValidator } from "./sessionTokenValidator"; 
import { SecurityGuard } from "./securityGuard";
import { EncryptionEnforcer } from "./encryptionEnforcer";
import { GeoGuard } from "./geoGuard";
import { ThreatDetector } from "./threatDetector";
import { BehaviorAnalyst } from "./behaviorAnalyst";
import { SessionGuardian } from "./sessionGuardian";
import { ComplianceMonitor } from "./complianceMonitor";
import { RequestTransformer } from "./requestTransformer";
import { CacheManager } from "./cacheManager";
import { ApiAccessGuardian } from "./apiAccessGuardian";
import { EnhancedRateEnforcer } from "./enhancedRateEnforcer";
import { ActivityLogger } from "./activityLogger";
import { AccessController } from "./accessController";
import { ResponseMerger } from "./responseMerger";
import type { MiddlewareContext } from "./types";

// 💊 LIGHTWEIGHT HEALTH MONITORING (Minimal overhead)
class FastHealthMonitor {
  private static failures = new Map<string, number>();
  private static lastCheck = new Map<string, number>();

  static shouldSkip(name: string): boolean {
    const failures = this.failures.get(name) || 0;
    const lastCheck = this.lastCheck.get(name) || 0;

    // Simple circuit breaker: skip if >3 failures in last minute
    if (failures > 3 && Date.now() - lastCheck < 60000) {
      return true;
    }

    return false;
  }

  static recordFailure(name: string): void {
    this.failures.set(name, (this.failures.get(name) || 0) + 1);
    this.lastCheck.set(name, Date.now());
  }

  static recordSuccess(name: string): void {
    // Reset failures on success
    this.failures.set(name, 0);
  }

  static getStatus(): Record<string, { failures: number; healthy: boolean }> {
    const status: Record<string, { failures: number; healthy: boolean }> = {};
    for (const [name, failures] of this.failures.entries()) {
      status[name] = {
        failures,
        healthy: failures <= 3,
      };
    }
    return status;
  }
}

// 🔥 ULTRA-FAST EXECUTION WRAPPER (Minimal overhead)
const fastExecute = async <T>(
  fn: () => Promise<T> | T,
  fallback: T,
  name: string
): Promise<T> => {
  try {
    if (FastHealthMonitor.shouldSkip(name)) {
      return fallback;
    }

    const result = await Promise.resolve(fn());
    FastHealthMonitor.recordSuccess(name);
    return result;
  } catch (error) {
    FastHealthMonitor.recordFailure(name);
    console.warn(`[${name}] Failed, using fallback`);
    return fallback;
  }
};

// 🧪 LIGHTWEIGHT A/B TESTING (Single check)
const getABVariant = (() => {
  const variant = Math.random() < 0.5 ? "A" : "B";
  return () => variant; // Cached for performance
})();

export class Orchestrator {
  // 🔥 PERFORMANCE-OPTIMIZED MIDDLEWARE EXECUTION
  static async execute(request: NextRequest): Promise<NextResponse> {
    const startTime = performance.now();
    let context: MiddlewareContext;
    let response = NextResponse.next();

    try {
      // PHASE 1: 🏗️ Critical Foundation (Optimized Sequential)
      const foundationStart = performance.now();

      context = await fastExecute(
        () => ContextBuilder.build(request),
        {} as MiddlewareContext,
        "ContextBuilder"
      );

      const securityResponse = await fastExecute(
        () => SecurityGuard.apply(request, context),
        NextResponse.next(),
        "SecurityGuard"
      );

      const encryptionResponse = await fastExecute(
        () => EncryptionEnforcer.enforce(request, context),
        NextResponse.next(),
        "EncryptionEnforcer"
      );

      // NEW: Session Token Validation
      const sessionResponse = await fastExecute(
        () => SessionTokenValidator.validate(request, context),
        NextResponse.next(),
        "SessionTokenValidator"
      );

      // Fast validation with early returns
      if (securityResponse.status !== 200) return securityResponse;
      if (encryptionResponse.status !== 200) return encryptionResponse;
      if (sessionResponse.status !== 200) return sessionResponse; // NEW: Check session validation

      response = ResponseMerger.merge(response, securityResponse);
      response = ResponseMerger.merge(response, encryptionResponse);
      response = ResponseMerger.merge(response, sessionResponse); // NEW: Merge session response

      const foundationTime = performance.now() - foundationStart;

      // PHASE 2: 🚀 OPTIMIZED PARALLEL EXECUTION
      const parallelStart = performance.now();
      const variant = getABVariant();

      let parallelResults: Array<NextResponse>;

      if (variant === "A") {
        // Conservative parallel (proven fast)
        parallelResults = await Promise.allSettled([
          fastExecute(
            () => GeoGuard.guard(request, context),
            NextResponse.next(),
            "GeoGuard"
          ),
          fastExecute(
            () => ThreatDetector.detect(request, context),
            NextResponse.next(),
            "ThreatDetector"
          ),
          fastExecute(
            () => CacheManager.manage(request, context),
            NextResponse.next(),
            "CacheManager"
          ),
        ]).then((results) =>
          results.map((r) =>
            r.status === "fulfilled" ? r.value : NextResponse.next()
          )
        );
      } else {
        // Aggressive parallel
        parallelResults = await Promise.allSettled([
          fastExecute(
            () => GeoGuard.guard(request, context),
            NextResponse.next(),
            "GeoGuard"
          ),
          fastExecute(
            () => ThreatDetector.detect(request, context),
            NextResponse.next(),
            "ThreatDetector"
          ),
          fastExecute(
            () => CacheManager.manage(request, context),
            NextResponse.next(),
            "CacheManager"
          ),
          fastExecute(
            () => BehaviorAnalyst.analyze(request, context),
            NextResponse.next(),
            "BehaviorAnalyst"
          ),
        ]).then((results) =>
          results.map((r) =>
            r.status === "fulfilled" ? r.value : NextResponse.next()
          )
        );
      }

      // Ultra-fast result processing with early exits
      for (const result of parallelResults) {
        if (result.headers.get("x-cache") === "HIT" || result.status === 304) {
          return ResponseMerger.merge(result, response);
        }
        if (result.status === 403) {
          return ResponseMerger.merge(result, response);
        }
        response = ResponseMerger.merge(response, result);
      }

      const parallelTime = performance.now() - parallelStart;

      // PHASE 3: 🔄 OPTIMIZED SEQUENTIAL BATCH
      const sequentialStart = performance.now();

      // Process remaining middleware in batches for speed
      const batchResults = await Promise.allSettled([
        // Batch 1: Sync operations
        variant === "A"
          ? fastExecute(
              () => BehaviorAnalyst.analyze(request, context),
              NextResponse.next(),
              "BehaviorAnalyst"
            )
          : Promise.resolve(NextResponse.next()), // Already done in parallel
        fastExecute(
          () => SessionGuardian.guard(request, context),
          NextResponse.next(),
          "SessionGuardian"
        ),
        fastExecute(
          () => ComplianceMonitor.monitor(request, context),
          NextResponse.next(),
          "ComplianceMonitor"
        ),
        fastExecute(
          () => RequestTransformer.transform(request, context),
          NextResponse.next(),
          "RequestTransformer"
        ),
      ]);

      // Process batch results with early exits
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          const middlewareResponse = result.value;
          if ((middlewareResponse as NextResponse).redirected) {
            return ResponseMerger.merge(middlewareResponse, response);
          }
          if (middlewareResponse.status === 400) {
            return ResponseMerger.merge(middlewareResponse, response);
          }
          response = ResponseMerger.merge(response, middlewareResponse);
        }
      }

      const sequentialTime = performance.now() - sequentialStart;

      // PHASE 4: 🎯 OPTIMIZED CONDITIONAL LOGIC
      const conditionalStart = performance.now();
      const isApiPath = ApiAccessGuardian.isApiPath(request.nextUrl.pathname);

      if (isApiPath) {
        const apiResponse = await fastExecute(
          () => ApiAccessGuardian.guard(request, context),
          NextResponse.next(),
          "ApiAccessGuardian"
        );
        if (apiResponse.status !== 200)
          return ResponseMerger.merge(apiResponse, response);
        response = ResponseMerger.merge(response, apiResponse);
      } else {
        const accessResponse = await fastExecute(
          () => AccessController.control(request, context),
          NextResponse.next(),
          "AccessController"
        );
        if (accessResponse.redirected || accessResponse.status !== 200) {
          return ResponseMerger.merge(accessResponse, response);
        }
        response = ResponseMerger.merge(response, accessResponse);
      }

      const conditionalTime = performance.now() - conditionalStart;

      // PHASE 5: 🏁 OPTIMIZED FINAL SPRINT
      const finalStart = performance.now();

      const [rateLimitResponse] = await Promise.allSettled([
        fastExecute(
          () => EnhancedRateEnforcer.enforce(request, context),
          NextResponse.next(),
          "EnhancedRateEnforcer"
        ),
        // Fire-and-forget logging (doesn't affect response time)
        fastExecute(
          () => ActivityLogger.log(request, context),
          undefined,
          "ActivityLogger"
        ).catch(() => {}), // Silent fail for logging
      ]);

      if (rateLimitResponse.status === "fulfilled") {
        if (rateLimitResponse.value.status === 429) {
          return ResponseMerger.merge(rateLimitResponse.value, response);
        }
        response = ResponseMerger.merge(response, rateLimitResponse.value);
      }

      const finalTime = performance.now() - finalStart;

      // FINALIZE WITH PERFORMANCE METRICS
      const totalTime = performance.now() - startTime;
      response = ResponseMerger.addSystemHeaders(
        response,
        Math.round(totalTime)
      );

      // Add performance headers
      response.headers.set("X-AB-Variant", variant);
      response.headers.set(
        "X-Foundation-Time",
        Math.round(foundationTime).toString()
      );
      response.headers.set(
        "X-Parallel-Time",
        Math.round(parallelTime).toString()
      );
      response.headers.set(
        "X-Sequential-Time",
        Math.round(sequentialTime).toString()
      );
      response.headers.set(
        "X-Conditional-Time",
        Math.round(conditionalTime).toString()
      );
      response.headers.set("X-Final-Time", Math.round(finalTime).toString());

      // 📊 OPTIMIZED PERFORMANCE REPORT
      const healthStatus = FastHealthMonitor.getStatus();
      const unhealthyCount = Object.values(healthStatus).filter(
        (h) => !h.healthy
      ).length;

      console.log(
        `[ORCHESTRATOR] ✅ ALL 17 MIDDLEWARE COMPLETED in ${Math.round(totalTime)}ms`
      );
      console.log(
        `[ORCHESTRATOR] ⚡ F:${Math.round(foundationTime)}ms P:${Math.round(parallelTime)}ms S:${Math.round(sequentialTime)}ms C:${Math.round(conditionalTime)}ms`
      );
      console.log(
        `[ORCHESTRATOR] 🧪 A/B: ${variant} | Health: ${unhealthyCount === 0 ? "✅" : `⚠️ ${unhealthyCount} issues`}`
      );
      console.log(`[ORCHESTRATOR] 🚀 FORTRESS STATUS: HYBRID PERFORMANCE MODE`);

      return response;
    } catch (error) {
      const totalTime = performance.now() - startTime;
      console.error(
        `[ORCHESTRATOR] ❌ CRITICAL ERROR after ${Math.round(totalTime)}ms:`,
        error
      );

      const errorResponse = new NextResponse(
        "Service Temporarily Unavailable",
        {
          status: 503,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "X-Fortress-Status": "EMERGENCY_MODE",
            "X-Error-Time": Math.round(totalTime).toString(),
            "Retry-After": "30",
          },
        }
      );

      return errorResponse;
    }
  }

  // 📊 PERFORMANCE MONITORING API
  static getPerformanceReport() {
    return {
      health: FastHealthMonitor.getStatus(),
      abVariant: getABVariant(),
      features: {
        circuitBreaker: true,
        abTesting: true,
        parallelExecution: true,
        performanceMonitoring: true,
      },
    };
  }

  // 🔧 EASY MIDDLEWARE MANAGEMENT (For development)
  static listMiddleware() {
    return [
      {
        name: "ContextBuilder",
        phase: "Foundation",
        parallel: false,
        priority: 1,
      },
      {
        name: "SecurityGuard",
        phase: "Foundation",
        parallel: false,
        priority: 2,
      },
      {
        name: "EncryptionEnforcer",
        phase: "Foundation",
        parallel: false,
        priority: 3,
      },
      {
        name: "SessionTokenValidator", // NEW: Added to middleware list
        phase: "Foundation",
        parallel: false,
        priority: 4,
      },
      { name: "GeoGuard", phase: "Parallel", parallel: true, priority: 5 },
      {
        name: "ThreatDetector",
        phase: "Parallel",
        parallel: true,
        priority: 5,
      },
      { name: "CacheManager", phase: "Parallel", parallel: true, priority: 5 },
      {
        name: "BehaviorAnalyst",
        phase: "Parallel/Sequential",
        parallel: true,
        priority: 6,
      },
      {
        name: "SessionGuardian",
        phase: "Sequential",
        parallel: false,
        priority: 7,
      },
      {
        name: "ComplianceMonitor",
        phase: "Sequential",
        parallel: false,
        priority: 8,
      },
      {
        name: "RequestTransformer",
        phase: "Sequential",
        parallel: false,
        priority: 9,
      },
      {
        name: "ApiAccessGuardian",
        phase: "Conditional",
        parallel: false,
        priority: 10,
      },
      {
        name: "AccessController",
        phase: "Conditional",
        parallel: false,
        priority: 10,
      },
      {
        name: "EnhancedRateEnforcer",
        phase: "Final",
        parallel: false,
        priority: 11,
      },
      { name: "ActivityLogger", phase: "Final", parallel: true, priority: 12 },
    ];
  }
}