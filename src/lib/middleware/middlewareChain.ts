import { NextRequest, NextResponse } from "next/server";

export type Middleware = (
  req: NextRequest
) => Promise<NextResponse> | NextResponse;

/**
 * Merge headers from "nextRes" into "base".
 * Values in "nextRes" will override if same header already exists.
 */
function mergeResponses(
  base: NextResponse,
  nextRes: NextResponse
): NextResponse {
  nextRes.headers.forEach((value, key) => {
    base.headers.set(key, value);
  });
  return base;
}

/**
 * Executes a chain of middlewares in order.
 * Each middleware can modify headers or short-circuit with a redirect/rewrite.
 */
export async function chainMiddlewares(
  req: NextRequest,
  middlewares: Middleware[]
): Promise<NextResponse> {
  // Start with a baseline NextResponse
  let response = NextResponse.next();

  for (const mw of middlewares) {
    const nextRes = await mw(req);

    // If middleware returns a redirect, rewrite, or error → stop chain immediately
    if (nextRes.redirected || nextRes.status !== 200) {
      return mergeResponses(nextRes, response);
    }

    // Merge headers into ongoing response
    response = mergeResponses(response, nextRes);
  }

  return response;
}
