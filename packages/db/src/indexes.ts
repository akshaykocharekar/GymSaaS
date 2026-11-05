import { Db } from "mongodb";
import { COLLECTIONS } from "./collections.js";

/**
 * Idempotent — safe to run on every deploy.
 * Matches PRD §3 schema.
 */
export async function createIndexes(db: Db): Promise<void> {
  // gyms
  await db.collection(COLLECTIONS.GYMS).createIndexes([
    { key: { email: 1 }, name: "gyms_email_unique", unique: true },
    { key: { status: 1 }, name: "gyms_status" },
    { key: { trialExpiresAt: 1 }, name: "gyms_trial_expires" },
    { key: { createdAt: -1 }, name: "gyms_created_desc" },
  ]);

  // users
  await db.collection(COLLECTIONS.USERS).createIndexes([
    { key: { email: 1 }, name: "users_email_unique", unique: true },
    { key: { gymId: 1, role: 1 }, name: "users_gym_role" },
  ]);

  // members
  await db.collection(COLLECTIONS.MEMBERS).createIndexes([
    { key: { gymId: 1, status: 1 }, name: "members_gym_status" },
    { key: { gymId: 1, expiryDate: 1 }, name: "members_gym_expiry" },
    { key: { gymId: 1, phone: 1 }, name: "members_gym_phone" },
    { key: { gymId: 1, createdAt: -1 }, name: "members_gym_created" },
  ]);

  // membership_plans
  await db.collection(COLLECTIONS.MEMBERSHIP_PLANS).createIndexes([
    { key: { gymId: 1, isActive: 1 }, name: "plans_gym_active" },
  ]);

  // payments (manual member payments)
  await db.collection(COLLECTIONS.PAYMENTS).createIndexes([
    { key: { gymId: 1, paymentDate: -1 }, name: "payments_gym_date" },
    { key: { gymId: 1, memberId: 1 }, name: "payments_gym_member" },
  ]);

  // membership_history
  await db.collection(COLLECTIONS.MEMBERSHIP_HISTORY).createIndexes([
    { key: { gymId: 1, memberId: 1 }, name: "history_gym_member" },
  ]);

  // licence_payments
  await db.collection(COLLECTIONS.LICENCE_PAYMENTS).createIndexes([
    { key: { razorpayOrderId: 1 }, name: "licence_order_unique", unique: true },
    {
      key: { razorpayPaymentId: 1 },
      name: "licence_payment_unique_sparse",
      unique: true,
      sparse: true,
    },
    { key: { gymId: 1, createdAt: -1 }, name: "licence_gym_created" },
  ]);

  // webhook_events (idempotency)
  await db.collection(COLLECTIONS.WEBHOOK_EVENTS).createIndexes([
    { key: { eventId: 1 }, name: "webhook_event_unique", unique: true },
  ]);
}