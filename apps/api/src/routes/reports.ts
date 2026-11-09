import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDb } from "@gymora/db";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const reportsRoutes = new Hono();

reportsRoutes.use("*", requireAuth, requireAnyPermission("VIEW_REPORTS"));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

function lastNMonths(n: number) {
  const arr: {
    year: number;
    month: number;
    label: string;
    start: Date;
    end: Date;
  }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    arr.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: start.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      start,
      end,
    });
  }
  return arr;
}

// ─── Membership revenue (last 6 months) ────────────────
reportsRoutes.get("/revenue", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const months = lastNMonths(6);
  const results = await Promise.all(
    months.map(async (m) => {
      const agg = await db
        .collection("payments")
        .aggregate<{ total: number }>([
          { $match: { gymId, paymentDate: { $gte: m.start, $lt: m.end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray();
      return { label: m.label, total: agg[0]?.total ?? 0 };
    })
  );
  return c.json({ ok: true, months: results });
});

// ─── Session pack revenue (last 6 months) ──────────────
reportsRoutes.get("/session-revenue", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const months = lastNMonths(6);

  const results = await Promise.all(
    months.map(async (m) => {
      const agg = await db
        .collection("session_packs")
        .aggregate<{ total: number; count: number }>([
          {
            $match: {
              gymId,
              purchasedAt: { $gte: m.start, $lt: m.end },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$pricePaid" },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();
      return {
        label: m.label,
        total: agg[0]?.total ?? 0,
        count: agg[0]?.count ?? 0,
      };
    })
  );
  return c.json({ ok: true, months: results });
});

// ─── Trainer payouts (last 6 months) ───────────────────
reportsRoutes.get("/trainer-payouts", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const months = lastNMonths(6);

  const results = await Promise.all(
    months.map(async (m) => {
      const agg = await db
        .collection("trainer_payouts")
        .aggregate<{ total: number; count: number }>([
          { $match: { gymId, paidOn: { $gte: m.start, $lt: m.end } } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();
      return {
        label: m.label,
        total: agg[0]?.total ?? 0,
        count: agg[0]?.count ?? 0,
      };
    })
  );
  return c.json({ ok: true, months: results });
});

// ─── Dues (expired members) ────────────────────────────
reportsRoutes.get("/dues", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const now = new Date();
  const expired = await db
    .collection("members")
    .find({ gymId, isInactive: false, expiryDate: { $lt: now } })
    .sort({ expiryDate: 1 })
    .toArray();
  return c.json({
    ok: true,
    count: expired.length,
    members: expired.map((m: any) => ({
      id: m._id.toString(),
      fullName: m.fullName,
      phone: m.phone,
      expiryDate: m.expiryDate,
    })),
  });
});

// ─── Plan distribution ─────────────────────────────────
reportsRoutes.get("/distribution", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const plans = await db
    .collection("membership_plans")
    .find({ gymId, isActive: true })
    .toArray();
  const results = await Promise.all(
    plans.map(async (p: any) => {
      const count = await db
        .collection("members")
        .countDocuments({ gymId, planId: p._id });
      return { planName: p.name, count, price: p.price };
    })
  );
  return c.json({ ok: true, distribution: results });
});

// ─── New registrations (last 6 months) ─────────────────
reportsRoutes.get("/new-registrations", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const months = lastNMonths(6);
  const results = await Promise.all(
    months.map(async (m) => {
      const count = await db
        .collection("members")
        .countDocuments({ gymId, createdAt: { $gte: m.start, $lt: m.end } });
      return { label: m.label, count };
    })
  );
  return c.json({ ok: true, months: results });
});

// ─── Renewals (last 6 months) ──────────────────────────
reportsRoutes.get("/renewals", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const months = lastNMonths(6);
  const results = await Promise.all(
    months.map(async (m) => {
      const count = await db
        .collection("membership_history")
        .countDocuments({ gymId, createdAt: { $gte: m.start, $lt: m.end } });
      return { label: m.label, count };
    })
  );
  return c.json({ ok: true, months: results });
});
