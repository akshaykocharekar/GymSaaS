
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export function errorHandler(err: Error, c: Context) {
  const path = c.req.path;
  const method = c.req.method;

  if (err instanceof ZodError) {
    console.warn(`[400] ${method} ${path} validation:`, err.flatten());
    return c.json(
      { error: "Validation failed", details: err.flatten() },
      400
    );
  }
  if (err instanceof HTTPException) {
    console.warn(`[${err.status}] ${method} ${path}: ${err.message}`);
    return c.json({ error: err.message }, err.status);
  }
  console.error(`[500] ${method} ${path}`, err);
  return c.json(
    {
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        message: err.message,
        stack: err.stack?.split("\n").slice(0, 8),
      }),
    },
    500
  );
}
