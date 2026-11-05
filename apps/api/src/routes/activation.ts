import { Hono } from "hono";
import {
  activationSchema,
  GYM_STATUS,
  TRIAL_DAYS,
  DEFAULT_PLANS,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { PlanRepo } from "../repositories/plans.js";
import { hashCode } from "../lib/crypto.js";
import { HTTPException } from "hono/http-exception";

export const activationRoutes = new Hono();

activationRoutes.post("/validate", async (c) => {
  const body = await c.req.json();
  const input = activationSchema.parse(body);
  const db = getDb();
  const gyms = new GymRepo(db);

  const gym = await gyms.findByEmail(input.email);
  if (!gym) throw new HTTPException(404, { message: "No gym found for this email" });

  if (gym.status === GYM_STATUS.ACTIVE_TRIAL || gym.status === GYM_STATUS.ACTIVE_PAID) {
    throw new HTTPException(409, { message: "Gym is already activated" });
  }
  if (gym.status !== GYM_STATUS.APPROVED) {
    throw new HTTPException(403, { message: `Gym is not approved (status: ${gym.status})` });
  }
  if (!gym.activationCodeHash || !gym.activationCodeExpiresAt) {
    throw new HTTPException(400, { message: "No activation code issued" });
  }
  if (gym.activationCodeExpiresAt.getTime() < Date.now()) {
    throw new HTTPException(400, { message: "Activation code has expired" });
  }
  if (gym.activationCodeUsedAt) {
    throw new HTTPException(409, { message: "Activation code already used" });
  }

  const hash = hashCode(input.code);
  if (hash !== gym.activationCodeHash) {
    throw new HTTPException(400, { message: "Invalid activation code" });
  }

  const now = new Date();
  const trialExpires = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);

  const updated = await gyms.updateById(gym._id!.toString(), {
    status: GYM_STATUS.ACTIVE_TRIAL,
    trialStartAt: now,
    trialExpiresAt: trialExpires,
    activationCodeUsedAt: now,
  });

  // Seed default plans (idempotent per activation — gym is fresh here)
  const plans = new PlanRepo(db);
  await plans.seedDefaults(gym._id!, DEFAULT_PLANS);

  return c.json({
    ok: true,
    message: "Activated. Trial started.",
    status: updated?.status,
    trialStartAt: updated?.trialStartAt,
    trialExpiresAt: updated?.trialExpiresAt,
  });
});