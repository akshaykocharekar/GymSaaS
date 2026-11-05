import { Hono } from "hono";
import { promises as dns } from "node:dns";
import {
  gymRegistrationSchema,
  loginSchema,
  GYM_STATUS,
  ROLES,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { UserRepo } from "../repositories/users.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccess, signRefresh } from "../lib/jwt.js";
import { HTTPException } from "hono/http-exception";

export const authRoutes = new Hono();

async function hasMxRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

authRoutes.post("/register-gym", async (c) => {
  const body = await c.req.json();
  const input = gymRegistrationSchema.parse(body);
  const db = getDb();
  const gyms = new GymRepo(db);
  const users = new UserRepo(db);

  const existingGym = await gyms.findByEmail(input.email);
  const existingUser = await users.findByEmail(input.email);
  if (existingGym || existingUser) {
    throw new HTTPException(409, { message: "Email already registered" });
  }

  // MX record check — email domain must have a mail server
  const hasMx = await hasMxRecord(input.email);
  if (!hasMx) {
    throw new HTTPException(400, {
      message: "Email domain cannot receive mail. Please check the address.",
    });
  }

  const passwordHash = await hashPassword(input.password);

  const gymRes = await gyms.create({
    name: input.gymName,
    ownerName: input.ownerName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    address: input.address,
    status: GYM_STATUS.PENDING_APPROVAL,
    trialStartAt: null,
    trialExpiresAt: null,
    licencePurchasedAt: null,
    licenceExpiresAt: null,
    activationCodeHash: null,
    activationCodeExpiresAt: null,
    activationCodeUsedAt: null,
    suspendedReason: null,
    notes: null,
  });

  await users.create({
    gymId: gymRes.insertedId,
    role: ROLES.OWNER,
    name: input.ownerName,
    email: input.email.toLowerCase(),
    passwordHash,
    status: "ACTIVE",
    permissions: [],
    lastLoginAt: null,
  });

  return c.json(
    {
      ok: true,
      message: "Registration received. Awaiting Superadmin approval.",
      gymId: gymRes.insertedId.toString(),
    },
    201
  );
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const input = loginSchema.parse(body);
  const db = getDb();
  const users = new UserRepo(db);
  const gyms = new GymRepo(db);

  const user = await users.findByEmail(input.email);
  if (!user || user.status !== "ACTIVE") {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new HTTPException(401, { message: "Invalid credentials" });

  let gymStatus: string | null = null;
  if (user.gymId) {
    const gym = await gyms.findById(user.gymId.toString());
    if (!gym) throw new HTTPException(401, { message: "Gym missing" });
    gymStatus = gym.status;
  }

  const payload = {
    sub: user._id!.toString(),
    role: user.role,
    gymId: user.gymId ? user.gymId.toString() : null,
  };

  await users.touchLogin(user._id!);

  return c.json({
    ok: true,
    accessToken: signAccess(payload),
    refreshToken: signRefresh(payload),
    user: {
      id: payload.sub,
      role: user.role,
      gymId: payload.gymId,
      name: user.name,
      email: user.email,
    },
    gymStatus,
  });
});