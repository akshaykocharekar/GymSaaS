import { Hono } from "hono";
import { z } from "zod";
import { ROLES } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const profileRoutes = new Hono();

profileRoutes.use("*", requireAuth, requireRole(ROLES.OWNER, ROLES.STAFF));

function getGymId(c: any): string {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return auth.gymId;
}

profileRoutes.get("/", async (c) => {
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(getGymId(c));
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });
  return c.json({
    ok: true,
    gym: {
      id: gym._id!.toString(),
      name: gym.name,
      ownerName: gym.ownerName,
      email: gym.email,
      phone: gym.phone,
      address: gym.address,
      status: gym.status,
      trialExpiresAt: gym.trialExpiresAt,
      licenceExpiresAt: gym.licenceExpiresAt,
    },
  });
});

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  ownerName: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),
  address: z.string().trim().min(5).max(300).optional(),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
});

profileRoutes.patch("/", async (c) => {
  const auth = c.get("auth") as any;
  if (auth.role !== ROLES.OWNER) {
    throw new HTTPException(403, {
      message: "Only owners can update the gym profile",
    });
  }

  const body = await c.req.json();
  const patch = patchSchema.parse(body);
  if (Object.keys(patch).length === 0) {
    throw new HTTPException(400, { message: "No fields to update" });
  }

  const gyms = new GymRepo(getDb());
  const updated = await gyms.updateById(getGymId(c), patch as any);
  if (!updated) throw new HTTPException(404, { message: "Gym not found" });

  return c.json({ ok: true });
});