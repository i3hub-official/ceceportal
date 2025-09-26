// File: src/lib/utils/auth-paths.ts
export const PUBLIC_PATHS = [
  "/",
  "/sitemap",
  "/center",
  "/center/*",
  "/login",
  "/signup",
] as const;

export const PRIVATE_PATHS = [
  "/admin",
  "/admin/*",
  "/settings",
  "/settings/*",
  "/profile",
  "/profile/*",
] as const;

export const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/resend-verification",
] as const;

// Type exports
export type PublicPath = (typeof PUBLIC_PATHS)[number];
export type PrivatePath = (typeof PRIVATE_PATHS)[number];
export type AuthPath = (typeof AUTH_PATHS)[number];

// Utility function for path matching - improved version
export function matchPath(
  targetPath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => {
    // Handle exact match
    if (pattern === targetPath) return true;

    // Handle wildcard patterns
    if (pattern.endsWith("/*")) {
      const basePattern = pattern.slice(0, -2); // Remove the trailing /*

      // Check if targetPath starts with the base pattern
      if (targetPath === basePattern) return true;

      // Check if targetPath starts with basePattern followed by a slash
      if (targetPath.startsWith(`${basePattern}/`)) return true;
    }

    return false;
  });
}

// Type guard functions
export function isPublicPath(path: string): path is PublicPath {
  return matchPath(path, PUBLIC_PATHS);
}

export function isPrivatePath(path: string): path is PrivatePath {
  return matchPath(path, PRIVATE_PATHS);
}

export function isAuthPath(path: string): path is AuthPath {
  return matchPath(path, AUTH_PATHS);
}

// Additional utility functions
export function getPathType(
  path: string
): "public" | "private" | "auth" | "unknown" {
  if (isPublicPath(path)) return "public";
  if (isPrivatePath(path)) return "private";
  if (isAuthPath(path)) return "auth";
  return "unknown";
}

export function requiresAuth(path: string): boolean {
  return isPrivatePath(path);
}

export function isAccessibleWithoutAuth(path: string): boolean {
  return isPublicPath(path) || isAuthPath(path);
}
