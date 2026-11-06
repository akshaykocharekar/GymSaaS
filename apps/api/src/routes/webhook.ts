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
} from "@gymora/shared";
import { env } from "../env.js";

export const webhookRoutes = new Hono();

webhookRoutes.post("/razorpay", async (c) => {
  const signature = c.req.header("x-razorpay-signature") || "";

  // Use raw clone to avoid body being consumed by earlier middleware (CORS).
  const rawBody = await c.req.raw.clone().text();

  // Debug — remove these 4 lines after tests pass
  console.log("=== WEBHOOK DEBUG ===");
  console.log("signature len:", signature.length);
  console.log("rawBody len:", rawBody.length);
  console.log("secret len:", env.RAZORPAY_WEBHOOK_SECRET?.length);

  const valid = verifyWebhookSignature({ rawBody, signature });
  console.log("signature valid:", valid);

  if (!valid) {
    return c.json({ error: "Invalid webhook signature" }, 400);
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const eventId =
    c.req.header("x-razorpay-event-id") || payload?.event_id;
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
      // Fake/test payment id — Razorpay 404s. Accept signature+idempotency as proof,
      // but DON'T upgrade the gym without real verification.
      return c.json({ ok: true, note: "payment not found in Razorpay" });
    }
    if (rp.status !== "captured") return c.json({ ok: true });

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
