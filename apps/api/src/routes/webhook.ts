import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDb } from "@gymora/db";
import {
  verifyWebhookSignature,
  fetchRazorpayPayment,
} from "../lib/razorpay.js";
import {
  LICENCE_PAYMENT_STATUS,
  LICENCE_PAYMENT_TYPE,
  GYM_STATUS,
  MAINTENANCE_DAYS,
  LICENCE_PRICE_PAISE,
  MAINTENANCE_PRICE_PAISE,
} from "@gymora/shared";

export const webhookRoutes = new Hono();

webhookRoutes.post("/razorpay", async (c) => {
  const signature = c.req.header("x-razorpay-signature") || "";
  const rawBody = await c.req.raw.clone().text();

  const valid = verifyWebhookSignature({ rawBody, signature });

  if (!valid) {
    return c.json({ error: "Invalid webhook signature" }, 400);
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const eventId = c.req.header("x-razorpay-event-id") || payload?.event_id;
  if (!eventId) return c.json({ error: "Missing event id" }, 400);

  const db = getDb();
  const events = db.collection("webhook_events");

  try {
    await events.insertOne({
      eventId,
      provider: "RAZORPAY",
      eventType: payload.event,
      processedAt: new Date(),
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      return c.json({ ok: true, duplicate: true });
    }
    throw e;
  }

  const event = payload.event;
  const payment = payload?.payload?.payment?.entity;
  if (!payment) return c.json({ ok: true });

  const orderId = payment.order_id;
  const paymentId = payment.id;
  const gymId = payment?.notes?.gymId;
  const paymentType = payment?.notes?.type;

  if (!orderId || !paymentId || !gymId) return c.json({ ok: true });

  const order = await db.collection("licence_payments").findOne({
    razorpayOrderId: orderId,
  });
  if (!order) return c.json({ ok: true });

  if (event === "payment.captured") {
    if (order.status === LICENCE_PAYMENT_STATUS.PAID) {
      return c.json({ ok: true, alreadyProcessed: true });
    }

    let rp;
    try {
      rp = await fetchRazorpayPayment(paymentId);
    } catch {
      return c.json({ ok: true, note: "payment not found in Razorpay" });
    }

    // SECURITY: Verify status, order, and amount against our expected constants
    const expectedAmount =
      paymentType === LICENCE_PAYMENT_TYPE.SOFTWARE_PURCHASE
        ? LICENCE_PRICE_PAISE
        : MAINTENANCE_PRICE_PAISE;

    if (
      rp.status !== "captured" ||
      rp.amount !== expectedAmount ||
      rp.order_id !== orderId
    ) {
      console.error(
        `[webhook] SECURITY REJECT: expected ${expectedAmount}, got ${rp.amount}`
      );
      return c.json({ ok: true });
    }

    const now = new Date();

    if (paymentType === LICENCE_PAYMENT_TYPE.SOFTWARE_PURCHASE) {
      const licenceEndsAt = new Date(now.getTime() + MAINTENANCE_DAYS * 86_400_000);
      await db.collection("licence_payments").updateOne(
        { _id: order._id },
        {
          $set: {
            razorpayPaymentId: paymentId,
            status: LICENCE_PAYMENT_STATUS.PAID,
            licenceStartsAt: now,
            licenceEndsAt,
            webhookEventId: eventId,
          },
        }
      );
      await db.collection("gyms").updateOne(
        { _id: new ObjectId(gymId) },
        {
          $set: {
            status: GYM_STATUS.ACTIVE_PAID,
            licencePurchasedAt: now,
            licenceExpiresAt: licenceEndsAt,
            updatedAt: now,
          },
        }
      );
    } else if (paymentType === LICENCE_PAYMENT_TYPE.MAINTENANCE) {
      const gym = await db
        .collection("gyms")
        .findOne({ _id: new ObjectId(gymId) });
      const base =
        gym?.licenceExpiresAt && new Date(gym.licenceExpiresAt) > now
          ? new Date(gym.licenceExpiresAt)
          : now;
      const newEnd = new Date(base.getTime() + MAINTENANCE_DAYS * 86_400_000);

      await db.collection("licence_payments").updateOne(
        { _id: order._id },
        {
          $set: {
            razorpayPaymentId: paymentId,
            status: LICENCE_PAYMENT_STATUS.PAID,
            licenceStartsAt: base,
            licenceEndsAt: newEnd,
            webhookEventId: eventId,
          },
        }
      );
      await db.collection("gyms").updateOne(
        { _id: new ObjectId(gymId) },
        { $set: { licenceExpiresAt: newEnd, updatedAt: now } }
      );
    }
  } else if (event === "payment.failed") {
    await db.collection("licence_payments").updateOne(
      { _id: order._id },
      {
        $set: {
          razorpayPaymentId: paymentId,
          status: LICENCE_PAYMENT_STATUS.FAILED,
          webhookEventId: eventId,
        },
      }
    );
  }

  return c.json({ ok: true });
});
