import { getDb } from "@gymora/db";
import { GYM_STATUS } from "@gymora/shared";

/**
 * Flips gyms whose trial expired from ACTIVE_TRIAL to TRIAL_EXPIRED.
 * Runs every hour.
 */
export function startTrialCron() {
  const tick = async () => {
    try {
      const db = getDb();
      const now = new Date();
      const result = await db.collection("gyms").updateMany(
        {
          status: GYM_STATUS.ACTIVE_TRIAL,
          trialExpiresAt: { $lt: now },
        },
        {
          $set: {
            status: GYM_STATUS.TRIAL_EXPIRED,
            updatedAt: now,
          },
        }
      );
      if (result.modifiedCount > 0) {
        console.log(
          `[trialCron] flipped ${result.modifiedCount} gyms to TRIAL_EXPIRED`
        );
      }
    } catch (e) {
      console.error("[trialCron] error:", e);
    }
  };

  // Run immediately, then every hour
  tick();
  setInterval(tick, 60 * 60 * 1000);
  console.log("✓ Trial expiry cron started (hourly)");
}