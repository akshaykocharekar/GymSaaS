import { Hono } from "hono";
import { ObjectId } from "mongodb";
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
    },
  });
});