// lib/logger.ts
async function generateUUID(): Promise<string> {
  if (typeof window !== "undefined" && crypto?.randomUUID) {
    // Browser supports Web Crypto API
    return crypto.randomUUID();
  }
  // Server (Node.js)
  const { randomUUID } = await import("crypto");
  return randomUUID();
}

export interface LogContext {
  ip?: string;
  userId?: string;
  email?: string;
  action?: string;
  resource?: string;
  statusCode?: number;
  error?: string;
  durationMs?: number;
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
  sessionId?: string;
  lastUsed?: string;
  expiresAt?: string;
  isActive?: boolean;
  userAgent?: string;
  ipAddress?: string;
  success?: boolean;
  cleanedCount?: number;
  resetLink?: string;
  userName?: string;
  nameLength?: number;
  name?: string;
  phone?: string;
  phoneLength?: number;
  passwordLength?: number;
  hasToken?: boolean;
  token?: string;
  status?: number;
  stack?: string;
  statusText?: string;
  count?: number;
  messageId?: string;
  to?: string;
  subject?: string;
  baseUrlUsed?: string;
  removed?: number;
  trigger?: string;
  route?: string;
  method?: string;
  url?: string;
  query?: string;
  body?: string;
  params?: string;
  [key: string]: unknown; // Allow additional dynamic fields
}

function format(
  level: string,
  message: string,
  context: LogContext = {},
  extra: Record<string, unknown> = {}
) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...extra,
  };
}

function log(
  level: string,
  msg: string,
  ctx: LogContext = {},
  extra: Record<string, unknown> = {}
) {
  const entry = format(level, msg, ctx, extra);

  if (process.env.NODE_ENV !== "production") {
    // Pretty logging in dev with console colors
    const colorMap: Record<string, string> = {
      INFO: "\x1b[36m", // cyan
      WARN: "\x1b[33m", // yellow
      ERROR: "\x1b[31m", // red
      DEBUG: "\x1b[35m", // magenta
    };
    const reset = "\x1b[0m";
    console.log(`${colorMap[level] || ""}[${level}]${reset}`, msg, ctx, extra);
  } else {
    // Production -> JSON for structured logging
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    log("INFO", msg, ctx, extra),
  warn: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    log("WARN", msg, ctx, extra),
  error: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    log("ERROR", msg, ctx, extra),
  debug: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    log("DEBUG", msg, ctx, extra),
  requestId: async () => await generateUUID(),
};
