import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { PAYMENT_METHOD, ROLES } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { PaymentRepo } from "../repositories/payments.js";
import { MemberRepo } from "../repositories/members.js";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const paymentRoutes = new Hono();

paymentRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}
function getUserId(c: any): ObjectId {
  return new ObjectId(c.get("auth").sub);
}

const recordSchema = z.object({
  memberId: z.string().min(1),
  amount: z.number().int().positive(),
  method: z.nativeEnum(PAYMENT_METHOD),
  paymentDate: z.coerce.date(),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  holdAsAdvance: z.boolean().default(false),
});

const listQuerySchema = z.object({
  memberId: z.string().optional(),
  method: z.nativeEnum(PAYMENT_METHOD).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

paymentRoutes.post(
  "/",
  requireAnyPermission("RECORD_PAYMENTS"),
  async (c) => {
    const body = await c.req.json();
    const input = recordSchema.parse(body);
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());
    const payments = new PaymentRepo(getDb());

    const member = await members.findByIdInGym(input.memberId, gymId);
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    const res = await payments.create({
      gymId,
      memberId: new ObjectId(input.memberId),
      amount: input.amount,
      method: input.method,
      paymentDate: input.paymentDate,
      note: input.note || null,
      recordedByUserId: getUserId(c),
    });

    let newBalance = member.advanceBalance || 0;
    if (input.holdAsAdvance) {
      const updated = await members.adjustAdvanceBalance(
        member._id!,
        gymId,
        input.amount
      );
      newBalance = updated?.advanceBalance || newBalance + input.amount;
    }

    return c.json(
      { ok: true, id: res.insertedId.toString(), advanceBalance: newBalance },
      201
    );
  }
);

paymentRoutes.get(
  "/",
  requireAnyPermission("VIEW_PAYMENTS", "RECORD_PAYMENTS"),
  async (c) => {
    const query = listQuerySchema.parse(
      Object.fromEntries(new URL(c.req.url).searchParams)
    );
    const payments = new PaymentRepo(getDb());
    const members = new MemberRepo(getDb());

    const docs = await payments.listByGym(getGymId(c), {
      memberId: query.memberId ? new ObjectId(query.memberId) : undefined,
      method: query.method,
      limit: query.limit,
      offset: query.offset,
    });

    const memberIds = [...new Set(docs.map((d) => d.memberId.toString()))];
    const memberMap = new Map<string, string>();
    await Promise.all(
      memberIds.map(async (id) => {
        const m = await members.findByIdInGym(id, getGymId(c));
        if (m) memberMap.set(id, m.fullName);
      })
    );

    return c.json({
      ok: true,
      payments: docs.map((p) => ({
        id: p._id!.toString(),
        memberId: p.memberId.toString(),
        memberName: memberMap.get(p.memberId.toString()) || "—",
        amount: p.amount,
        method: p.method,
        paymentDate: p.paymentDate,
        createdAt: p.createdAt,
        note: p.note,
      })),
    });
  }
);

paymentRoutes.get(
  "/stats",
  requireAnyPermission("VIEW_PAYMENTS", "RECORD_PAYMENTS"),
  async (c) => {
    const payments = new PaymentRepo(getDb());
    const gymId = getGymId(c);
    const [month, total] = await Promise.all([
      payments.sumThisMonth(gymId),
      payments.sumAllTime(gymId),
    ]);
    return c.json({ ok: true, thisMonth: month, allTime: total });
  }
);
