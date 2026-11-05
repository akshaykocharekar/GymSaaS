import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { ROLES } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const dashboardRoutes = new Hono();

dashboardRoutes.use("*", requireAuth, requireRole(ROLES.OWNER, ROLES.STAFF));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

dashboardRoutes.get("/", async (c) => {
  const db = getDb();
  const gymId = getGymId(c);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysOut = new Date(now.getTime() + 7 * 86_400_000);

  const [total, active, expired, expiring, recentPayments, monthRevenue] =
    await Promise.all([
      db.collection("members").countDocuments({ gymId }),
      db
        .collection("members")
        .countDocuments({ gymId, isInactive: false, expiryDate: { $gte: now } }),
      db
        .collection("members")
        .countDocuments({ gymId, isInactive: false, expiryDate: { $lt: now } }),
      db
        .collection("members")
        .countDocuments({
          gymId,
          isInactive: false,
          expiryDate: { $gte: now, $lte: sevenDaysOut },
        }),
      db
        .collection("payments")
        .find({ gymId })
        .sort({ paymentDate: -1, createdAt: -1 })
        .limit(5)
        .toArray(),
      db
        .collection("payments")
        .aggregate<{ total: number }>([
          { $match: { gymId, paymentDate: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
    ]);

  // Hydrate recent payment member names
  const memberIds = [...new Set(recentPayments.map((p: any) => p.memberId.toString()))];
  const memberMap = new Map<string, string>();
  await Promise.all(
    memberIds.map(async (id) => {
      const m = await db
        .collection("members")
        .findOne({ _id: new ObjectId(id), gymId });
      if (m) memberMap.set(id, (m as any).fullName);
    })
  );

  return c.json({
    ok: true,
    counts: { total, active, expired, expiring },
    monthRevenue: monthRevenue[0]?.total ?? 0,
    recentPayments: recentPayments.map((p: any) => ({
      id: p._id.toString(),
      memberId: p.memberId.toString(),
      memberName: memberMap.get(p.memberId.toString()) || "—",
      amount: p.amount,
      method: p.method,
      paymentDate: p.paymentDate,
    })),
  });
});