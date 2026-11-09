import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Safely reads a route param, throwing 400 if missing.
 * Hono types `c.req.param()` as `string | undefined` for TS strictness,
 * even though it's always present when the route matches.
 */
export function requireParam(c: Context, name: string): string {
  const value = c.req.param(name);
  if (!value) {
    throw new HTTPException(400, { message: `Missing route param: ${name}` });
  }
  return value;
}
