import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import {
  GYM_STATUS,
  ROLES,
  rejectGymSchema,
  suspendGymSchema,
  ACTIVATION_CODE_TTL_HOURS,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { GymRepo } from "../repositories/gyms.js";
import { generateActivationCode, hashCode } from "../lib/crypto.js";
import { sendEmail } from "../lib/email.js";
import { activationCodeEmailHtml, activationCodeEmailText } from "../templates/activation-code.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const adminRoutes = new Hono();

adminRoutes.use("*", requireAuth, requireRole(ROLES.SUPERADMIN));

// ─── Stats ─────────────────────────────────────────────
adminRoutes.get("/stats", async (c) => {
  const db = getDb();
  const gyms = new GymRepo(db);

  const [statusCounts, revenueRows, thisMonthRevenue] = await Promise.all([
    gyms.countsByStatus(),
    db
      .collection("licence_payments")
      .aggregate<{ total: number }>([
        { $match: { status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    (() => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return db
        .collection("licence_payments")
        .aggregate<{ total: number }>([
          { $match: { status: "PAID", createdAt: { $gte: start } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray();
    })(),
  ]);

  const totalGyms = Object.values(statusCounts).reduce((s, n) => s + n, 0);

  return c.json({
    ok: true,
    counts: {
      total: totalGyms,
      pending: statusCounts["PENDING_APPROVAL"] || 0,
      approved: statusCounts["APPROVED"] || 0,
      trial: statusCounts["ACTIVE_TRIAL"] || 0,
      paid: statusCounts["ACTIVE_PAID"] || 0,
      expired: statusCounts["TRIAL_EXPIRED"] || 0,
      suspended: statusCounts["SUSPENDED"] || 0,
      rejected: statusCounts["REJECTED"] || 0,
    },
    revenue: {
      allTime: revenueRows[0]?.total || 0,
      thisMonth: thisMonthRevenue[0]?.total || 0,
    },
  });
});

// ─── Pending registrations ─────────────────────────────
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

// ─── All gyms with filters ─────────────────────────────
const listGymsQuery = z.object({
  q: z.string().trim().optional(),
  status: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

adminRoutes.get("/gyms", async (c) => {
  const query = listGymsQuery.parse(
    Object.fromEntries(new URL(c.req.url).searchParams)
  );
  const gyms = new GymRepo(getDb());
  const { docs, total } = await gyms.listPaged({
    search: query.q,
    status: query.status as any,
    limit: query.limit,
    offset: query.offset,
  });
  return c.json({
    ok: true,
    total,
    gyms: docs.map((g) => ({
      id: g._id!.toString(),
      name: g.name,
      ownerName: g.ownerName,
      email: g.email,
      phone: g.phone,
      status: g.status,
      trialExpiresAt: g.trialExpiresAt,
      licencePurchasedAt: g.licencePurchasedAt,
      licenceExpiresAt: g.licenceExpiresAt,
      createdAt: g.createdAt,
    })),
  });
});

// ─── Single gym detail ─────────────────────────────────
adminRoutes.get("/gyms/:id", async (c) => {
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(c.req.param("id"));
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  const db = getDb();
  const payments = await db
    .collection("licence_payments")
    .find({ gymId: gym._id })
    .sort({ createdAt: -1 })
    .toArray();

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
      trialStartAt: gym.trialStartAt,
      trialExpiresAt: gym.trialExpiresAt,
      licencePurchasedAt: gym.licencePurchasedAt,
      licenceExpiresAt: gym.licenceExpiresAt,
      suspendedReason: gym.suspendedReason,
      notes: gym.notes,
      createdAt: gym.createdAt,
      hasActivationCode: !!gym.activationCodeHash && !gym.activationCodeUsedAt,
    },
    payments: payments.map((p: any) => ({
      id: p._id.toString(),
      orderId: p.razorpayOrderId,
      paymentId: p.razorpayPaymentId || null,
      amount: p.amount,
      paymentType: p.paymentType,
      status: p.status,
      createdAt: p.createdAt,
    })),
  });
});

// ─── Approve ───────────────────────────────────────────
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

  sendEmail({
    to: gym.email,
    toName: gym.ownerName,
    subject: `Your Palastra activation code: ${code}`,
    htmlContent: activationCodeEmailHtml({ gymName: gym.name, ownerName: gym.ownerName, code, expiresAt }),
    textContent: activationCodeEmailText({ gymName: gym.name, ownerName: gym.ownerName, code, expiresAt }),
  }).catch((err) => console.error("[admin] approve email failed:", err));

  return c.json({
    ok: true,
    message: "Approved. Activation code sent to gym email.",
    activationCode: code,
    expiresAt,
    email: gym.email,
    phone: gym.phone,
  });
});

// ─── Reject ────────────────────────────────────────────
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

// ─── Suspend ───────────────────────────────────────────
adminRoutes.post("/gyms/:id/suspend", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const input = suspendGymSchema.parse(body);
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(id);
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });

  await gyms.updateById(id, {
    status: GYM_STATUS.SUSPENDED,
    suspendedReason: input.reason,
  });
  return c.json({ ok: true, message: "Gym suspended" });
});

// ─── Reactivate ────────────────────────────────────────
adminRoutes.post("/gyms/:id/reactivate", async (c) => {
  const id = c.req.param("id");
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(id);
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });
  if (gym.status !== GYM_STATUS.SUSPENDED) {
    throw new HTTPException(409, { message: "Only suspended gyms can be reactivated" });
  }

  const newStatus = gym.licencePurchasedAt
    ? GYM_STATUS.ACTIVE_PAID
    : GYM_STATUS.ACTIVE_TRIAL;

  await gyms.updateById(id, {
    status: newStatus,
    suspendedReason: null,
  });
  return c.json({ ok: true, status: newStatus });
});

// ─── Resend activation code (FIXED) ────────────────────
adminRoutes.post("/gyms/:id/resend-code", async (c) => {
  const id = c.req.param("id");
  const gyms = new GymRepo(getDb());
  const gym = await gyms.findById(id);
  if (!gym) throw new HTTPException(404, { message: "Gym not found" });
  if (gym.status !== GYM_STATUS.APPROVED) {
    throw new HTTPException(409, {
      message: "Can only resend code for APPROVED gyms (not yet activated)",
    });
  }

  const code = generateActivationCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(
    Date.now() + ACTIVATION_CODE_TTL_HOURS * 60 * 60 * 1000
  );

  await gyms.updateById(id, {
    activationCodeHash: codeHash,
    activationCodeExpiresAt: expiresAt,
    activationCodeUsedAt: null,
  });

  // ACTUALLY SEND THE EMAIL
  sendEmail({
    to: gym.email,
    toName: gym.ownerName,
    subject: `Your new Palastra activation code: ${code}`,
    htmlContent: activationCodeEmailHtml({ gymName: gym.name, ownerName: gym.ownerName, code, expiresAt }),
    textContent: activationCodeEmailText({ gymName: gym.name, ownerName: gym.ownerName, code, expiresAt }),
  }).catch((err) => console.error("[admin] resend email failed:", err));

  return c.json({
    ok: true,
    activationCode: code,
    expiresAt,
    email: gym.email,
    phone: gym.phone,
  });
});

// ─── Licence payments (all gyms) ───────────────────────
adminRoutes.get("/licence-payments", async (c) => {
  const db = getDb();
  const payments = await db
    .collection("licence_payments")
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const gymIds = [...new Set(payments.map((p: any) => p.gymId.toString()))];
  const gymMap = new Map<string, { name: string; email: string }>();
  await Promise.all(
    gymIds.map(async (id) => {
      const g = await db.collection("gyms").findOne({ _id: new ObjectId(id) });
      if (g) gymMap.set(id, { name: (g as any).name, email: (g as any).email });
    })
  );

  return c.json({
    ok: true,
    payments: payments.map((p: any) => ({
      id: p._id.toString(),
      gymId: p.gymId.toString(),
      gymName: gymMap.get(p.gymId.toString())?.name || "—",
      gymEmail: gymMap.get(p.gymId.toString())?.email || "—",
      orderId: p.razorpayOrderId,
      paymentId: p.razorpayPaymentId || null,
      amount: p.amount,
      paymentType: p.paymentType,
      status: p.status,
      createdAt: p.createdAt,
    })),
  });

// ─── Pending emails (fallback when Brevo fails) ────────
adminRoutes.get("/emails/pending", async (c) => {
  const db = getDb();
  const docs = await db
    .collection("pending_emails")
    .find({ sent: false })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  return c.json({
    ok: true,
    emails: docs.map((e: any) => ({
      id: e._id.toString(),
      to: e.to,
      toName: e.toName,
      subject: e.subject,
      textContent: e.textContent,
      reason: e.reason,
      attempts: e.attempts,
      createdAt: e.createdAt,
    })),
  });
});

adminRoutes.post("/emails/:id/retry", async (c) => {
  const db = getDb();
  const doc = await db
    .collection("pending_emails")
    .findOne({ _id: new ObjectId(c.req.param("id")) });
  if (!doc) throw new HTTPException(404, { message: "Not found" });

  const ok = await sendEmail({
    to: doc.to,
    toName: doc.toName,
    subject: doc.subject,
    htmlContent: doc.htmlContent,
    textContent: doc.textContent,
  });

  if (ok) {
    await db.collection("pending_emails").updateOne(
      { _id: doc._id },
      { $set: { sent: true, sentAt: new Date() }, $inc: { attempts: 1 } }
    );
  } else {
    await db
      .collection("pending_emails")
      .updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
  }
  return c.json({ ok, sent: ok });
});

adminRoutes.post("/emails/:id/mark-sent", async (c) => {
  const db = getDb();
  await db.collection("pending_emails").updateOne(
    { _id: new ObjectId(c.req.param("id")) },
    { $set: { sent: true, sentAt: new Date(), manual: true } }
  );
  return c.json({ ok: true });
});

});
