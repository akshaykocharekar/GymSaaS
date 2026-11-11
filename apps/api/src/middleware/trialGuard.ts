import type { Context, Next } from "hono";
import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { getDb } from "@gymora/db";
import { GYM_STATUS } from "@gymora/shared";

/**
 * Blocks access to data routes when a gym's licence is not active.
 * Applied to /api/gym/* EXCEPT /api/gym/licence/* (which is mounted separately).
 */
export function trialGuard() {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth") as any;
    if (!auth?.gymId) return next(); // Superadmin or no-tenant — skip

    const gym = await getDb()
      .collection("gyms")
      .findOne({ _id: new ObjectId(auth.gymId) });

    if (!gym) throw new HTTPException(404, { message: "Gym not found" });

    // Allowed statuses: ACTIVE_TRIAL or ACTIVE_PAID
    const allowed = [GYM_STATUS.ACTIVE_TRIAL, GYM_STATUS.ACTIVE_PAID];
    
    if (allowed.includes(gym.status)) {
      // 1. Check Trial Expiry
      if (
        gym.status === GYM_STATUS.ACTIVE_TRIAL &&
        gym.trialExpiresAt &&
        new Date(gym.trialExpiresAt).getTime() < Date.now()
      ) {
        throw new HTTPException(402, {
          message: "Trial expired. Purchase a licence to continue.",
          cause: { code: "TRIAL_EXPIRED" },
        });
      }

      // 2. Check Maintenance Expiry (ACTIVE_PAID only)
      if (
        gym.status === GYM_STATUS.ACTIVE_PAID &&
        gym.licenceExpiresAt &&
        new Date(gym.licenceExpiresAt).getTime() < Date.now()
      ) {
        throw new HTTPException(402, {
          message: "Annual maintenance expired. Please renew to continue.",
          cause: { code: "MAINTENANCE_EXPIRED" },
        });
      }

      return next();
    }

    // Suspended / rejected / cancelled — hard block
    throw new HTTPException(402, {
      message: "Access restricted. Please purchase or contact support.",
      cause: { code: "LICENCE_REQUIRED", status: gym.status },
    });
  };
}