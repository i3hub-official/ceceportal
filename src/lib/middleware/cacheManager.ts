// ========================================
// 💾 TASK 11: CACHE MANAGER - Performance Optimizer
// Responsibility: Cache responses and reduce database load
// ========================================

// File: src/lib/middleware/cacheManager.ts
import { NextRequest, NextResponse } from "next/server";
import type { MiddlewareContext } from "./types";
import crypto from "crypto";

interface CacheEntry {
  data: unknown;
  headers: Record<string, string>;
  timestamp: number;
  expiry: number;
  etag: string;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Max entries in cache
  varyByUser: boolean; // Include user info in cache key
  varyByQuery: boolean; // Include query params in cache key
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry>();
  private static cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  private static readonly DEFAULT_CONFIG: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    varyByUser: false,
    varyByQuery: true,
  };

  private static readonly PATH_CONFIGS: Record<string, CacheConfig> = {
    "/api/v1/audit/stats": {
      enabled: true,
      ttl: 60 * 1000, // 1 minute for stats
      maxSize: 100,
      varyByUser: true,
      varyByQuery: false,
    },
    "/api/v1/audit": {
      enabled: true,
      ttl: 30 * 1000, // 30 seconds for audit logs
      maxSize: 500,
      varyByUser: true,
      varyByQuery: true,
    },
    "/": {
      enabled: true,
      ttl: 10 * 60 * 1000, // 10 minutes for public pages
      maxSize: 50,
      varyByUser: false,
      varyByQuery: false,
    },
  };

  static async manage(
    request: NextRequest,
    context: MiddlewareContext
  ): Promise<NextResponse> {
    try {
      const config = this.getConfigForPath(request.nextUrl.pathname);

      if (!config.enabled || request.method !== "GET") {
        return NextResponse.next();
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(request, context, config);

      // Check for cached response
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && this.isValidEntry(cachedEntry)) {
        // Check ETag for conditional requests
        const clientETag = request.headers.get("if-none-match");
        if (clientETag === cachedEntry.etag) {
          this.cacheStats.hits++;
          return new NextResponse(null, {
            status: 304,
            headers: {
              etag: cachedEntry.etag,
              "x-cache": "HIT-304",
              "x-cache-key": cacheKey.substring(0, 16) + "...",
            },
          });
        }

        // Return cached response
        this.cacheStats.hits++;
        const headers = new Headers(cachedEntry.headers);
        headers.set("x-cache", "HIT");
        headers.set(
          "x-cache-age",
          Math.floor((Date.now() - cachedEntry.timestamp) / 1000).toString()
        );
        headers.set("x-cache-key", cacheKey.substring(0, 16) + "...");

        console.log(
          `[CACHE MANAGER] ✅ Cache HIT for ${request.nextUrl.pathname}`
        );
        return new NextResponse(JSON.stringify(cachedEntry.data), {
          status: 200,
          headers,
        });
      }

      // Cache miss - continue with request but mark for caching
      this.cacheStats.misses++;
      const response = NextResponse.next();
      response.headers.set("x-cache", "MISS");
      response.headers.set("x-cache-key", cacheKey.substring(0, 16) + "...");

      console.log(
        `[CACHE MANAGER] ⏳ Cache MISS for ${request.nextUrl.pathname}`
      );
      return response;
    } catch (error) {
      console.error("[CACHE MANAGER] Error in cache management:", error);
      return NextResponse.next();
    }
  }

  static cacheResponse(
    cacheKey: string,
    response: unknown,
    headers: Headers,
    config: CacheConfig
  ): void {
    try {
      // Clean cache if at max size
      if (this.cache.size >= config.maxSize) {
        this.evictOldest();
      }

      const etag = this.generateETag(response);
      const entry: CacheEntry = {
        data: response,
        headers: Object.fromEntries(headers.entries()),
        timestamp: Date.now(),
        expiry: Date.now() + config.ttl,
        etag,
      };

      this.cache.set(cacheKey, entry);
      console.log(
        `[CACHE MANAGER] 💾 Cached response for key: ${cacheKey.substring(0, 20)}...`
      );
    } catch (error) {
      console.error("[CACHE MANAGER] Error caching response:", error);
    }
  }

  private static generateCacheKey(
    request: NextRequest,
    context: MiddlewareContext,
    config: CacheConfig
  ): string {
    let key = `${request.method}:${request.nextUrl.pathname}`;

    if (config.varyByQuery) {
      const params = Array.from(request.nextUrl.searchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      if (params) key += `?${params}`;
    }

    if (config.varyByUser && context.hasSession) {
      key += `:user:${context.sessionToken?.substring(0, 8)}`;
    }

    return key;
  }

  private static isValidEntry(entry: CacheEntry): boolean {
    return Date.now() < entry.expiry;
  }

  private static evictOldest(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheStats.evictions++;
    }
  }

  private static generateETag(data: unknown): string {
    return `"${crypto
      .createHash("sha256")
      .update(
        JSON.stringify(
          data,
          typeof data === "object" && data !== null ? Object.keys(data).sort() : []
        )
      )
      .digest("hex")
      .substring(0, 32)}"`;
  }

  private static getConfigForPath(pathname: string): CacheConfig {
    for (const [path, config] of Object.entries(this.PATH_CONFIGS)) {
      if (pathname.startsWith(path)) {
        return config;
      }
    }
    return this.DEFAULT_CONFIG;
  }

  static getCacheStats() {
    return {
      ...this.cacheStats,
      size: this.cache.size,
      hitRate:
        this.cacheStats.hits /
          (this.cacheStats.hits + this.cacheStats.misses) || 0,
    };
  }

  static clearCache(): void {
    this.cache.clear();
    console.log("[CACHE MANAGER] 🗑️ Cache cleared");
  }
}
