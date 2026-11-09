import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDb } from "@gymora/db";
import { requireAuth } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const dashboardRoutes = new Hono();

dashboardRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

const querySchema = z.object({
  range: z.enum(["1m", "3m", "6m", "12m"]).default("1m"),
});

function rangeToStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case "1m":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1);
    case "12m":
      return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

dashboardRoutes.get("/", async (c) => {
  const { range } = querySchema.parse(
    Object.fromEntries(new URL(c.req.url).searchParams)
  );
  const db = getDb();
  const gymId = getGymId(c);
  const now = new Date();
  const rangeStart = rangeToStart(range);
  const sevenDaysOut = new Date(now.getTime() + 7 * 86_400_000);

  const [total, active, expired, expiring, recentPayments, rangePayments] =
    await Promise.all([
      db.collection("members").countDocuments({ gymId }),
      db
        .collection("members")
        .countDocuments({ gymId, isInactive: false, expiryDate: { $gte: now } }),
      db
        .collection("members")
        .countDocuments({ gymId, isInactive: false, expiryDate: { $lt: now } }),
      db.collection("members").countDocuments({
        gymId,
        isInactive: false,
        expiryDate: { $gte: now, $lte: sevenDaysOut },
      }),
      db
        .collection("payments")
        .find({ gymId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      db
        .collection("payments")
        .find({ gymId, paymentDate: { $gte: rangeStart } })
        .toArray(),
    ]);

  let membershipRevenue = 0;
  let sessionRevenue = 0;
  for (const p of rangePayments) {
    const note = (p.note || "") as string;
    if (note.startsWith("Session pack:")) {
      sessionRevenue += p.amount as number;
    } else {
      membershipRevenue += p.amount as number;
    }
  }
  const totalRevenue = membershipRevenue + sessionRevenue;

  const memberIds = [
    ...new Set(recentPayments.map((p: any) => p.memberId.toString())),
  ];
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
    range,
    counts: { total, active, expired, expiring },
    revenue: {
      membership: membershipRevenue,
      session: sessionRevenue,
      total: totalRevenue,
    },
    recentPayments: recentPayments.map((p: any) => ({
      id: p._id.toString(),
      memberId: p.memberId.toString(),
      memberName: memberMap.get(p.memberId.toString()) || "—",
      amount: p.amount,
      method: p.method,
      paymentDate: p.paymentDate,
      note: p.note,
    })),
  });
});
