import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function loginRateLimiter(c: Context, next: Next) {
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  let record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }

  record.count++;
  loginAttempts.set(ip, record);

  if (record.count > maxAttempts) {
    throw new HTTPException(429, {
      message: "Too many login attempts. Please try again in 15 minutes.",
    });
  }

  await next();
}
