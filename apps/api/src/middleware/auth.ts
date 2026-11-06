import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyAccess, type AccessPayload } from "../lib/jwt.js";
import { ROLES, type Role, type Permission } from "@gymora/shared";

declare module "hono" {
  interface ContextVariableMap {
    auth: AccessPayload;
  }
}

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HTTPException(401, {
      message: "Missing or malformed Authorization header",
    });
  }
  try {
    const payload = verifyAccess(token);
    c.set("auth", payload);
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
  await next();
}

export function requireRole(...allowed: Role[]) {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth");
    if (!auth || !allowed.includes(auth.role)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }
    await next();
  };
}

/**
 * Allows request if user is OWNER (has all permissions implicitly)
 * OR if their JWT includes the required permission.
 */
export function requirePermission(perm: Permission) {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth");
    if (!auth) {
      throw new HTTPException(401, { message: "Not authenticated" });
    }
    if (auth.role === ROLES.OWNER) {
      await next();
      return;
    }
    if (auth.role === ROLES.STAFF) {
      const perms = auth.permissions || [];
      if (perms.includes(perm)) {
        await next();
        return;
      }
      throw new HTTPException(403, {
        message: `Missing permission: ${perm}`,
      });
    }
    throw new HTTPException(403, { message: "Forbidden" });
  };
}

export function attachTenant() {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth");
    if (!auth || !auth.gymId) {
      throw new HTTPException(403, { message: "No tenant context" });
    }
    c.set("gymId" as never, auth.gymId as never);
    await next();
  };
}