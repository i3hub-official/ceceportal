// ========================================
// 🛡️ TASK 12: THREAT DETECTOR - Advanced Security Scanner
// Responsibility: Detect and block sophisticated attacks
// ========================================

// File: src/lib/middleware/threatDetector.ts
import { NextRequest, NextResponse } from "next/server";
import type { MiddlewareContext } from "./types";

interface ThreatScore {
  score: number; // 0-100, higher = more dangerous
  reasons: string[];
  category: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class ThreatDetector {
  private static suspiciousIPs = new Map<string, { count: number, lastSeen: number }>();
  
  private static readonly THREAT_PATTERNS = {
    // SQL Injection patterns
    SQL_INJECTION: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b.*\b(FROM|INTO|SET|TABLE|DATABASE)\b)/gi,
      /'.*(\bOR\b|\bAND\b).*'.*=/gi,
      /1=1|1=0|'='|"="/gi,
      /--|\|\|/g,
    ],
    
    // XSS patterns
    XSS: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:|vbscript:|data:|file:/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi,
    ],
    
    // Command injection
    COMMAND_INJECTION: [
      /[;&|`$\(\){}]/g,
      /\b(wget|curl|nc|netcat|telnet|ssh)\b/gi,
      /\.\.\/|\.\.\\|\.\.\%2f/gi,
      /(cmd|command|powershell|bash|sh)\.exe/gi,
    ],
    
    // Path traversal
    PATH_TRAVERSAL: [
      /(\.\.(\/|\\|%2f|%5c)){2,}/gi,
      /(\/etc\/|\/proc\/|\/sys\/|C:\\Windows\\|C:\\Program)/gi,
      /\0|%00/gi,
    ],
    
    // Bot signatures
    BOT_SIGNATURES: [
      /bot|crawler|spider|scraper/gi,
      /automated|headless|phantom|selenium/gi,
      /curl|wget|python-requests|postman/gi,
    ],
  };

  static async detect(request: NextRequest, context: MiddlewareContext): Promise<NextResponse> {
    try {
      const threatScore = this.calculateThreatScore(request, context);
      
      // Update suspicious IP tracking
      this.updateSuspiciousIPs(context.clientIp, threatScore.score);
      
      // Block high/critical threats
      if (threatScore.category === "CRITICAL" || threatScore.score > 80) {
        console.log(`[THREAT DETECTOR] ❌ CRITICAL threat blocked: ${threatScore.reasons.join(", ")}`);
        return this.createThreatResponse(threatScore, "BLOCKED");
      }
      
      // Rate limit high threats
      if (threatScore.category === "HIGH" || threatScore.score > 60) {
        console.log(`[THREAT DETECTOR] ⚠️ HIGH threat detected: ${threatScore.reasons.join(", ")}`);
        // Apply extra rate limiting for suspicious requests
        const response = NextResponse.next();
        response.headers.set("x-threat-level", threatScore.category);
        response.headers.set("x-threat-score", threatScore.score.toString());
        response.headers.set("x-extra-rate-limit", "true");
        return response;
      }
      
      // Log medium threats but allow
      if (threatScore.category === "MEDIUM") {
        console.log(`[THREAT DETECTOR] ⚡ MEDIUM threat logged: ${threatScore.reasons.join(", ")}`);
      }
      
      const response = NextResponse.next();
      response.headers.set("x-threat-level", threatScore.category);
      response.headers.set("x-threat-score", threatScore.score.toString());
      
      return response;

    } catch (error) {
      console.error("[THREAT DETECTOR] Error in threat detection:", error);
      return NextResponse.next();
    }
  }

  private static calculateThreatScore(request: NextRequest, context: MiddlewareContext): ThreatScore {
    let score = 0;
    const reasons: string[] = [];

    // Check URL and query parameters
    const fullUrl = request.url;
    score += this.checkPatterns(fullUrl, "URL", reasons);

    // Check headers
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    score += this.checkPatterns(userAgent, "User-Agent", reasons);
    score += this.checkPatterns(referer, "Referer", reasons);

    // Check for suspicious IP behavior
    const ipHistory = this.suspiciousIPs.get(context.clientIp);
    if (ipHistory && ipHistory.count > 10) {
      score += 20;
      reasons.push("Repeated suspicious activity from IP");
    }

    // Check request frequency (basic rate analysis)
    if (this.isHighFrequencyIP(context.clientIp)) {
      score += 15;
      reasons.push("High request frequency");
    }

    // Check for missing or suspicious headers
    if (!userAgent || userAgent.length < 10) {
      score += 10;
      reasons.push("Missing or suspicious User-Agent");
    }

    // Check for API abuse patterns
    if (request.nextUrl.pathname.startsWith("/api/v1")) {
      if (!request.headers.get("authorization")) {
        score += 5;
        reasons.push("API access without authorization");
      }
    }

    // Determine category
    let category: ThreatScore['category'] = "LOW";
    if (score >= 80) category = "CRITICAL";
    else if (score >= 60) category = "HIGH";
    else if (score >= 40) category = "MEDIUM";

    return { score, reasons, category };
  }

  private static checkPatterns(input: string, source: string, reasons: string[]): number {
    let score = 0;

    for (const [category, patterns] of Object.entries(this.THREAT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          const points = this.getPointsForCategory(category);
          score += points;
          reasons.push(`${category} pattern in ${source}`);
          break; // Don't double-count same category
        }
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  private static getPointsForCategory(category: string): number {
    switch (category) {
      case "SQL_INJECTION": return 30;
      case "XSS": return 25;
      case "COMMAND_INJECTION": return 35;
      case "PATH_TRAVERSAL": return 20;
      case "BOT_SIGNATURES": return 10;
      default: return 5;
    }
  }

  private static updateSuspiciousIPs(ip: string, score: number): void {
    if (score > 40) {
      const current = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0 };
      this.suspiciousIPs.set(ip, {
        count: current.count + 1,
        lastSeen: Date.now(),
      });
    }
  }

  private static isHighFrequencyIP(ip: string): boolean {
    // Simple implementation - in production, use Redis or proper tracking
    return false; // Placeholder
  }

  private static createThreatResponse(threatScore: ThreatScore, action: string): NextResponse {
    return NextResponse.json({
      success: false,
      error: {
        code: "THREAT_DETECTED",
        message: "Request blocked due to security concerns",
        category: threatScore.category,
        action,
      }
    }, { 
      status: 403,
      headers: {
        "X-Threat-Score": threatScore.score.toString(),
        "X-Threat-Category": threatScore.category,
      }
    });
  }
}