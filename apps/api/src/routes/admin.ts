import { Hono } from "hono";
import {
  GYM_STATUS,
  rejectGymSchema,
  ACTIVATION_CODE_TTL_HOURS,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { generateActivationCode, hashCode } from "../lib/crypto.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "@gymora/shared";
import { HTTPException } from "hono/http-exception";

export const adminRoutes = new Hono();

adminRoutes.use("*", requireAuth, requireRole(ROLES.SUPERADMIN));

// List pending gym registrations
adminRoutes.get("/gyms/pending", async (c) => {
  const gyms = new GymRepo(getDb());
  const list = await gyms.listByStatus(GYM_STATUS.PENDING_APPROVAL);
  return c.json({
    ok: true,
    gyms: list.map((g) => ({
      id: g._id!.toString(),
      name: g.name,
      ownerName: g.ownerName,
      email: g.email,
      phone: g.phone,
      address: g.address,
      status: g.status,
      createdAt: g.createdAt,
    })),
  });
});

// List all gyms (optionally filtered by status)
adminRoutes.get("/gyms", async (c) => {
  const status = c.req.query("status");
  const gyms = new GymRepo(getDb());
  const list = status
    ? await gyms.listByStatus(status as any)
    : await gyms.listAll();
  return c.json({
    ok: true,
    gyms: list.map((g) => ({
      id: g._id!.toString(),
      name: g.name,
      email: g.email,
      status: g.status,
      trialExpiresAt: g.trialExpiresAt,
      licencePurchasedAt: g.licencePurchasedAt,
      createdAt: g.createdAt,
    })),
  });
});

// Approve gym → generate activation code
adminRoutes.post("/gyms/:id/approve", async (c) => {
  const id = c.req.param("id");
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(id);
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });
  if (gym.status !== GYM_STATUS.PENDING_APPROVAL) {
    throw new HTTPException(409, {
      message: `Cannot approve gym with status ${gym.status}`,
    });
  }

  const code = generateActivationCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(
    Date.now() + ACTIVATION_CODE_TTL_HOURS * 60 * 60 * 1000
  );

  await gyms.updateById(id, {
    status: GYM_STATUS.APPROVED,
    activationCodeHash: codeHash,
    activationCodeExpiresAt: expiresAt,
    activationCodeUsedAt: null,
  });

  // IMPORTANT: code is returned ONLY here, to Superadmin.
  // Never included in any other response.
  return c.json({
    ok: true,
    message: "Approved. Share activation code with the gym owner.",
    activationCode: code,
    expiresAt,
    email: gym.email,
    phone: gym.phone,
  });
});

// Reject gym
adminRoutes.post("/gyms/:id/reject", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const input = rejectGymSchema.parse(body);
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(id);
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  await gyms.updateById(id, {
    status: GYM_STATUS.REJECTED,
    notes: input.reason,
  });
  return c.json({ ok: true, message: "Gym rejected" });
});