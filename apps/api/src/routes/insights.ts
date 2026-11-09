import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { getDb } from "@gymora/db";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const insightsRoutes = new Hono();

insightsRoutes.use("*", requireAuth, requireAnyPermission("VIEW_REPORTS"));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

function monthsAgoStart(n: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 1);
}

insightsRoutes.get("/", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgoStart = monthsAgoStart(5);

  // ─── Revenue this month vs last month ─────────────────
  const [thisMonthPayments, lastMonthPayments, sixMonthPayments] =
    await Promise.all([
      db
        .collection("payments")
        .find({ gymId, paymentDate: { $gte: thisMonthStart } })
        .toArray(),
      db
        .collection("payments")
        .find({
          gymId,
          paymentDate: { $gte: lastMonthStart, $lt: thisMonthStart },
        })
        .toArray(),
      db
        .collection("payments")
        .find({ gymId, paymentDate: { $gte: sixMonthsAgoStart } })
        .toArray(),
    ]);

  const sum = (arr: any[], filter?: (p: any) => boolean) =>
    arr.filter(filter || (() => true)).reduce((s, p) => s + p.amount, 0);

  const thisMonthMembership = sum(
    thisMonthPayments,
    (p) => !(p.note || "").startsWith("Session pack:")
  );
  const thisMonthSession = sum(thisMonthPayments, (p) =>
    (p.note || "").startsWith("Session pack:")
  );
  const thisMonthTotal = thisMonthMembership + thisMonthSession;

  const lastMonthMembership = sum(
    lastMonthPayments,
    (p) => !(p.note || "").startsWith("Session pack:")
  );
  const lastMonthSession = sum(lastMonthPayments, (p) =>
    (p.note || "").startsWith("Session pack:")
  );
  const lastMonthTotal = lastMonthMembership + lastMonthSession;

  const momChangePct =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0
      ? 100
      : 0;

  // ─── Retention: members who renewed this month ────────
  const renewalsThisMonth = await db
    .collection("membership_history")
    .countDocuments({
      gymId,
      createdAt: { $gte: thisMonthStart },
    });
  const expiredThisMonth = await db
    .collection("members")
    .countDocuments({
      gymId,
      isInactive: false,
      expiryDate: { $gte: thisMonthStart, $lte: now },
    });
  const renewedMembers = await db
    .collection("members")
    .countDocuments({
      gymId,
      isInactive: false,
      expiryDate: { $gt: now },
      updatedAt: { $gte: thisMonthStart },
    });
  const totalExpiringThisMonth = expiredThisMonth + renewedMembers;
  const retentionPct =
    totalExpiringThisMonth > 0
      ? Math.round((renewedMembers / totalExpiringThisMonth) * 100)
      : null;

  // ─── ARPU (avg revenue per active member) ─────────────
  const activeMemberCount = await db
    .collection("members")
    .countDocuments({ gymId, isInactive: false, expiryDate: { $gt: now } });
  const arpu =
    activeMemberCount > 0 ? Math.round(thisMonthTotal / activeMemberCount) : 0;

  // ─── Collection rate ──────────────────────────────────
  // "Expected" = active members × their plan price
  const activeMembers = await db
    .collection("members")
    .find({ gymId, isInactive: false, expiryDate: { $gt: now } })
    .toArray();
  const planIds = [
    ...new Set(activeMembers.map((m: any) => m.planId.toString())),
  ];
  const plans = await db
    .collection("membership_plans")
    .find({ _id: { $in: planIds.map((id) => new ObjectId(id)) } })
    .toArray();
  const planPriceMap = new Map<string, number>();
  plans.forEach((p: any) => planPriceMap.set(p._id.toString(), p.price));

  const expectedMonthly = activeMembers.reduce((sum, m: any) => {
    return sum + (planPriceMap.get(m.planId.toString()) || 0);
  }, 0);
  const collectionRate =
    expectedMonthly > 0
      ? Math.min(100, Math.round((thisMonthMembership / expectedMonthly) * 100))
      : null;

  // ─── Top 10 members by lifetime value ─────────────────
  const topMembersAgg = await db
    .collection("payments")
    .aggregate([
      { $match: { gymId } },
      { $group: { _id: "$memberId", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ])
    .toArray();
  const topMemberIds = topMembersAgg.map((r: any) => r._id.toString());
  const topMemberDocs = await db
    .collection("members")
    .find({ _id: { $in: topMemberIds.map((id) => new ObjectId(id)) } })
    .toArray();
  const topMemberMap = new Map<string, any>();
  topMemberDocs.forEach((m: any) => topMemberMap.set(m._id.toString(), m));

  const topMembers = topMembersAgg.map((r: any) => {
    const m = topMemberMap.get(r._id.toString());
    return {
      memberId: r._id.toString(),
      name: m?.fullName || "—",
      phone: m?.phone || "—",
      lifetimeValue: r.total,
    };
  });

  // ─── Trainer ROI ──────────────────────────────────────
  const trainers = await db.collection("trainers").find({ gymId }).toArray();
  const trainerPayoutsAgg = await db
    .collection("trainer_payouts")
    .aggregate([
      { $match: { gymId, paidOn: { $gte: sixMonthsAgoStart } } },
      { $group: { _id: "$trainerId", total: { $sum: "$amount" } } },
    ])
    .toArray();
  const trainerPayoutMap = new Map<string, number>();
  trainerPayoutsAgg.forEach((r: any) =>
    trainerPayoutMap.set(r._id.toString(), r.total)
  );

  const sessionPacksByTrainer = await db
    .collection("session_packs")
    .aggregate([
      { $match: { gymId, purchasedAt: { $gte: sixMonthsAgoStart } } },
      {
        $group: {
          _id: "$trainerId",
          revenue: { $sum: "$pricePaid" },
          packs: { $sum: 1 },
        },
      },
    ])
    .toArray();
  const trainerRevMap = new Map<
    string,
    { revenue: number; packs: number }
  >();
  sessionPacksByTrainer.forEach((r: any) => {
    if (r._id) trainerRevMap.set(r._id.toString(), r);
  });

  const trainerRoi = trainers.map((t: any) => {
    const id = t._id.toString();
    const revenue = trainerRevMap.get(id)?.revenue || 0;
    const packs = trainerRevMap.get(id)?.packs || 0;
    const cost = trainerPayoutMap.get(id) || 0;
    const roi = cost > 0 ? Math.round((revenue / cost) * 100) : null;
    return {
      trainerId: id,
      name: t.name,
      packs,
      revenue,
      cost,
      roi, // % of cost that came back as revenue; >100 = profitable
    };
  });

  // ─── Revenue by plan ──────────────────────────────────
  const plansAll = await db
    .collection("membership_plans")
    .find({ gymId, isActive: true })
    .toArray();
  const revenueByPlan: {
    planName: string;
    revenue: number;
    memberCount: number;
  }[] = [];
  for (const p of plansAll) {
    const memberCount = await db
      .collection("members")
      .countDocuments({ gymId, planId: p._id });
    if (memberCount > 0) {
      // Compute revenue from initial memberships of members on this plan
      const memberIds = await db
        .collection("members")
        .find({ gymId, planId: p._id })
        .project({ _id: 1 })
        .toArray();
      const ids = memberIds.map((m: any) => m._id);
      const revenue = await db
        .collection("payments")
        .aggregate([
          {
            $match: {
              gymId,
              memberId: { $in: ids },
              paymentDate: { $gte: sixMonthsAgoStart },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray();
      revenueByPlan.push({
        planName: p.name,
        revenue: revenue[0]?.total || 0,
        memberCount,
      });
    }
  }
  revenueByPlan.sort((a, b) => b.revenue - a.revenue);

  // ─── Monthly revenue trend (6 months) ─────────────────
  const monthlyTrend: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = sixMonthPayments
      .filter((p: any) => p.paymentDate >= start && p.paymentDate < end)
      .reduce((s, p: any) => s + p.amount, 0);
    monthlyTrend.push({
      label: start.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      total,
    });
  }

  return c.json({
    ok: true,
    revenue: {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      momChangePct,
      thisMonthMembership,
      thisMonthSession,
    },
    retention: {
      renewalsThisMonth,
      renewedMembers,
      retentionPct,
    },
    arpu,
    collectionRate,
    activeMemberCount,
    topMembers,
    trainerRoi,
    revenueByPlan,
    monthlyTrend,
  });
});
