import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  ROLES,
  LICENCE_PRICE_PAISE,
  MAINTENANCE_PRICE_PAISE,
  MAINTENANCE_DAYS,
  MAINTENANCE_RENEWAL_WINDOW_DAYS,
  LICENCE_PAYMENT_TYPE,
  LICENCE_PAYMENT_STATUS,
  GYM_STATUS,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchRazorpayPayment,
} from "../lib/razorpay.js";
import { env } from "../env.js";
import { HTTPException } from "hono/http-exception";

export const licenceRoutes = new Hono();

licenceRoutes.use("*", requireAuth, requireRole(ROLES.OWNER));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

licenceRoutes.post("/purchase", async (c) => {
  const gymId = getGymId(c);
  const db = getDb();
  const gym = await db.collection("gyms").findOne({ _id: gymId });
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  if (gym.status === GYM_STATUS.ACTIVE_PAID) {
    throw new HTTPException(409, { message: "Licence already purchased" });
  }

  const receipt = `lic_${gymId.toString()}_${Date.now()}`;
  const order = await createRazorpayOrder({
    amount: LICENCE_PRICE_PAISE,
    receipt,
    notes: {
      gymId: gymId.toString(),
      type: LICENCE_PAYMENT_TYPE.SOFTWARE_PURCHASE,
    },
  });

  await db.collection("licence_payments").insertOne({
    gymId,
    razorpayOrderId: order.id,
    amount: LICENCE_PRICE_PAISE,
    paymentType: LICENCE_PAYMENT_TYPE.SOFTWARE_PURCHASE,
    status: LICENCE_PAYMENT_STATUS.CREATED,
    createdAt: new Date(),
  });

  return c.json({
    ok: true,
    orderId: order.id,
    amount: LICENCE_PRICE_PAISE,
    currency: "INR",
    keyId: env.RAZORPAY_KEY_ID,
    gymName: gym.name,
    ownerName: gym.ownerName,
    email: gym.email,
    phone: gym.phone,
  });
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

licenceRoutes.post("/verify", async (c) => {
  const body = await c.req.json();
  const input = verifySchema.parse(body);
  const gymId = getGymId(c);
  const db = getDb();

  const order = await db.collection("licence_payments").findOne({
    gymId,
    razorpayOrderId: input.razorpay_order_id,
  });
  if (!order) throw new HTTPException(404, { message: "Order not found" });

  if (order.status === LICENCE_PAYMENT_STATUS.PAID) {
    return c.json({ ok: true, message: "Already verified" });
  }

  const valid = verifyPaymentSignature({
    orderId: input.razorpay_order_id,
    paymentId: input.razorpay_payment_id,
    signature: input.razorpay_signature,
  });
  if (!valid) {
    throw new HTTPException(400, { message: "Invalid payment signature" });
  }

  const rpPayment = await fetchRazorpayPayment(input.razorpay_payment_id);
  const expectedAmount =
    order.paymentType === LICENCE_PAYMENT_TYPE.MAINTENANCE
      ? MAINTENANCE_PRICE_PAISE
      : LICENCE_PRICE_PAISE;

  if (
    rpPayment.status !== "captured" ||
    rpPayment.order_id !== input.razorpay_order_id ||
    rpPayment.amount !== expectedAmount
  ) {
    throw new HTTPException(400, {
      message: "Payment not captured or amount mismatch",
    });
  }

  const now = new Date();

  if (order.paymentType === LICENCE_PAYMENT_TYPE.SOFTWARE_PURCHASE) {
    const licenceEndsAt = new Date(now.getTime() + MAINTENANCE_DAYS * 86_400_000);

    await db.collection("licence_payments").updateOne(
      { _id: order._id },
      {
        $set: {
          razorpayPaymentId: input.razorpay_payment_id,
          razorpaySignature: input.razorpay_signature,
          status: LICENCE_PAYMENT_STATUS.PAID,
          licenceStartsAt: now,
          licenceEndsAt,
        },
      }
    );

    await db.collection("gyms").updateOne(
      { _id: gymId },
      {
        $set: {
          status: GYM_STATUS.ACTIVE_PAID,
          licencePurchasedAt: now,
          licenceExpiresAt: licenceEndsAt,
          updatedAt: now,
        },
      }
    );

    return c.json({
      ok: true,
      message: "Licence activated",
      licenceExpiresAt: licenceEndsAt,
    });
  }

  const gym = await db.collection("gyms").findOne({ _id: gymId });
  const base =
    gym?.licenceExpiresAt && new Date(gym.licenceExpiresAt) > now
      ? new Date(gym.licenceExpiresAt)
      : now;
  const newEnd = new Date(base.getTime() + MAINTENANCE_DAYS * 86_400_000);

  await db.collection("licence_payments").updateOne(
    { _id: order._id },
    {
      $set: {
        razorpayPaymentId: input.razorpay_payment_id,
        razorpaySignature: input.razorpay_signature,
        status: LICENCE_PAYMENT_STATUS.PAID,
        licenceStartsAt: base,
        licenceEndsAt: newEnd,
      },
    }
  );

  await db.collection("gyms").updateOne(
    { _id: gymId },
    { $set: { licenceExpiresAt: newEnd, updatedAt: now } }
  );

  return c.json({
    ok: true,
    message: "Maintenance renewed",
    licenceExpiresAt: newEnd,
  });
});

licenceRoutes.get("/status", async (c) => {
  const gymId = getGymId(c);
  const gym = await getDb().collection("gyms").findOne({ _id: gymId });
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  const now = new Date();
  const maintenanceDaysLeft = gym.licenceExpiresAt
    ? daysBetween(now, new Date(gym.licenceExpiresAt))
    : null;

  const canRenewMaintenance =
    gym.status === GYM_STATUS.ACTIVE_PAID &&
    maintenanceDaysLeft !== null &&
    maintenanceDaysLeft <= MAINTENANCE_RENEWAL_WINDOW_DAYS;

  return c.json({
    ok: true,
    status: gym.status,
    licencePurchasedAt: gym.licencePurchasedAt,
    licenceExpiresAt: gym.licenceExpiresAt,
    trialExpiresAt: gym.trialExpiresAt,
    maintenanceDaysLeft,
    canRenewMaintenance,
    prices: {
      licence: LICENCE_PRICE_PAISE,
      maintenance: MAINTENANCE_PRICE_PAISE,
    },
  });
});

licenceRoutes.post("/maintenance", async (c) => {
  const gymId = getGymId(c);
  const db = getDb();
  const gym = await db.collection("gyms").findOne({ _id: gymId });
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  if (gym.status !== GYM_STATUS.ACTIVE_PAID) {
    throw new HTTPException(400, {
      message: "Must have active paid licence first",
    });
  }

  const daysLeft = gym.licenceExpiresAt
    ? daysBetween(new Date(), new Date(gym.licenceExpiresAt))
    : 0;
  if (daysLeft > MAINTENANCE_RENEWAL_WINDOW_DAYS) {
    throw new HTTPException(400, {
      message: `Maintenance can be renewed ${MAINTENANCE_RENEWAL_WINDOW_DAYS} days before expiry (${daysLeft} days left)`,
    });
  }

  const receipt = `mnt_${gymId.toString()}_${Date.now()}`;
  const order = await createRazorpayOrder({
    amount: MAINTENANCE_PRICE_PAISE,
    receipt,
    notes: {
      gymId: gymId.toString(),
      type: LICENCE_PAYMENT_TYPE.MAINTENANCE,
    },
  });

  await db.collection("licence_payments").insertOne({
    gymId,
    razorpayOrderId: order.id,
    amount: MAINTENANCE_PRICE_PAISE,
    paymentType: LICENCE_PAYMENT_TYPE.MAINTENANCE,
    status: LICENCE_PAYMENT_STATUS.CREATED,
    createdAt: new Date(),
  });

  return c.json({
    ok: true,
    orderId: order.id,
    amount: MAINTENANCE_PRICE_PAISE,
    currency: "INR",
    keyId: env.RAZORPAY_KEY_ID,
    gymName: gym.name,
    ownerName: gym.ownerName,
    email: gym.email,
    phone: gym.phone,
  });
});
