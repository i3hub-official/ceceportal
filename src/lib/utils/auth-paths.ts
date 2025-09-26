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

// Utility function for path matching
export function matchPath(
  targetPath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => {
    if (pattern.includes("*")) {
      const regex = new RegExp(
        `^${pattern.replace(/\*/g, "[^/]+").replace(/\//g, "\\/")}$`
      );
      return regex.test(targetPath);
    }
    return targetPath === pattern;
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
