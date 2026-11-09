import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../env.js";
import type { Role, Permission } from "@gymora/shared";

export interface AccessPayload {
  sub: string;
  role: Role;
  gymId: string | null;
  permissions?: Permission[];
}

export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"],
  });
}

export function signRefresh(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as SignOptions["expiresIn"],
  });
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefresh(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessPayload;
}
