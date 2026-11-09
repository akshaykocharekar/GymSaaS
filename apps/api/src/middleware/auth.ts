import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyAccess, type AccessPayload } from "../lib/jwt.js";
import {
  ROLES,
  type Role,
  type Permission,
} from "@gymora/shared";
import { hasAnyPermission } from "../lib/permissions.js";

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
 * Allows request if OWNER or SUPERADMIN, or STAFF with any of the given perms.
 * Use this instead of requirePermission for endpoints that can be reached by
 * either of two equivalent permissions (e.g., MANAGE_MEMBERS implies VIEW_MEMBERS).
 */
export function requireAnyPermission(...perms: Permission[]) {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth");
    if (!auth) throw new HTTPException(401, { message: "Not authenticated" });

    if (
      auth.role === ROLES.OWNER ||
      auth.role === ROLES.SUPERADMIN ||
      hasAnyPermission(auth.role, auth.permissions, perms)
    ) {
      await next();
      return;
    }
    throw new HTTPException(403, {
      message: `Missing permission: ${perms.join(" or ")}`,
    });
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