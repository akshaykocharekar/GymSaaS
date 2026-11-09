import { Hono } from "hono";
import { ObjectId } from "mongodb";
import {
  createMemberSchema,
  updateMemberSchema,
  setInactiveSchema,
  memberListQuerySchema,
  ROLES,
  MAX_MEMBERS_PER_GYM,
  PAYMENT_METHOD,
} from "@gymora/shared";
import { z } from "zod";
import { getDb } from "@gymora/db";
import { MemberRepo } from "../repositories/members.js";
import { PlanRepo } from "../repositories/plans.js";
import { PaymentRepo } from "../repositories/payments.js";
import { HistoryRepo } from "../repositories/history.js";
import { computeMemberStatus } from "../lib/memberStatus.js";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const memberRoutes = new Hono();

memberRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}
function getUserId(c: any): ObjectId {
  return new ObjectId(c.get("auth").sub);
}

function serializeMember(m: any) {
  return {
    id: m._id.toString(),
    fullName: m.fullName,
    phone: m.phone,
    email: m.email,
    address: m.address,
    joiningDate: m.joiningDate,
    planId: m.planId.toString(),
    membershipStartDate: m.membershipStartDate,
    expiryDate: m.expiryDate,
    isInactive: m.isInactive,
    advanceBalance: m.advanceBalance || 0,
    trainerId: m.trainerId ? m.trainerId.toString() : null,
    status: computeMemberStatus({
      expiryDate: m.expiryDate,
      isInactive: m.isInactive,
    }),
    notes: m.notes,
    createdAt: m.createdAt,
  };
}

// ─── GET list ──────────────────────────────────────────
memberRoutes.get(
  "/",
  requireAnyPermission("VIEW_MEMBERS", "MANAGE_MEMBERS"),
  async (c) => {
    const query = memberListQuerySchema.parse(
      Object.fromEntries(new URL(c.req.url).searchParams)
    );
    const members = new MemberRepo(getDb());
    const { docs, total } = await members.list(getGymId(c), query);
    return c.json({ ok: true, total, members: docs.map(serializeMember) });
  }
);

// ─── POST create (with optional initial payment) ───────
memberRoutes.post(
  "/",
  requireAnyPermission("MANAGE_MEMBERS"),
  async (c) => {
    const body = await c.req.json();
    const input = createMemberSchema.parse(body);
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());
    const plans = new PlanRepo(getDb());
    const payments = new PaymentRepo(getDb());
    const history = new HistoryRepo(getDb());

    const count = await members.countByGym(gymId);
    if (count >= MAX_MEMBERS_PER_GYM) {
      throw new HTTPException(403, {
        message: `Member limit reached (${MAX_MEMBERS_PER_GYM}). Contact support to increase.`,
      });
    }

    const plan = await plans.findByIdInGym(input.planId, gymId);
    if (!plan) throw new HTTPException(400, { message: "Invalid plan" });

    const expiryDate = new Date(
      input.membershipStartDate.getTime() + plan.durationDays * 86_400_000
    );

    const res = await members.create(gymId, expiryDate, input);
    const memberId = res.insertedId;

    // Record initial payment + history unless explicitly disabled
    const shouldCollect = input.collectPayment !== false;
    if (shouldCollect) {
      const amount = input.initialPaymentAmount ?? plan.price;

      if (amount > 0) {
        await payments.create({
          gymId,
          memberId,
          amount,
          method: input.initialPaymentMethod || "CASH",
          paymentDate: input.membershipStartDate,
          note: `Initial ${plan.name} membership`,
          recordedByUserId: getUserId(c),
        });
      }

      await history.create({
        gymId,
        memberId,
        planId: plan._id!,
        planName: plan.name,
        durationDays: plan.durationDays,
        startDate: input.membershipStartDate,
        expiryDate,
        amountPaid: amount > 0 ? amount : null,
      });
    }

    return c.json({ ok: true, id: memberId.toString() }, 201);
  }
);

// ─── GET one ───────────────────────────────────────────
memberRoutes.get(
  "/:id",
  requireAnyPermission("VIEW_MEMBERS", "MANAGE_MEMBERS"),
  async (c) => {
    const members = new MemberRepo(getDb());
    const m = await members.findByIdInGym(c.req.param("id"), getGymId(c));
    if (!m) throw new HTTPException(404, { message: "Member not found" });
    return c.json({ ok: true, member: serializeMember(m) });
  }
);

// ─── PATCH edit ────────────────────────────────────────
memberRoutes.patch(
  "/:id",
  requireAnyPermission("MANAGE_MEMBERS"),
  async (c) => {
    const body = await c.req.json();
    const patch = updateMemberSchema.parse(body);
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());

    let expiryDate: Date | undefined;
    if (patch.planId || patch.membershipStartDate) {
      const existing = await members.findByIdInGym(c.req.param("id"), gymId);
      if (!existing) throw new HTTPException(404, { message: "Member not found" });
      const plans = new PlanRepo(getDb());
      const plan = await plans.findByIdInGym(
        patch.planId || existing.planId.toString(),
        gymId
      );
      if (!plan) throw new HTTPException(400, { message: "Invalid plan" });
      const start = patch.membershipStartDate || existing.membershipStartDate;
      expiryDate = new Date(start.getTime() + plan.durationDays * 86_400_000);
    }

    const updated = await members.updateInGym(c.req.param("id"), gymId, {
      ...patch,
      expiryDate,
    });
    if (!updated) throw new HTTPException(404, { message: "Member not found" });
    return c.json({ ok: true, member: serializeMember(updated) });
  }
);

// ─── PATCH toggle inactive ─────────────────────────────
memberRoutes.patch(
  "/:id/inactive",
  requireAnyPermission("MANAGE_MEMBERS"),
  async (c) => {
    const body = await c.req.json();
    const input = setInactiveSchema.parse(body);
    const members = new MemberRepo(getDb());
    const updated = await members.updateInGym(c.req.param("id"), getGymId(c), {
      isInactive: input.isInactive,
    });
    if (!updated) throw new HTTPException(404, { message: "Member not found" });
    return c.json({ ok: true, member: serializeMember(updated) });
  }
);

// ─── POST renew ────────────────────────────────────────
const renewSchema = z.object({
  planId: z.string().min(1),
  amountPaid: z.number().int().nonnegative().optional(),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD).default(PAYMENT_METHOD.CASH),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  useAdvanceBalance: z.boolean().default(false),
});

memberRoutes.post(
  "/:id/renew",
  requireAnyPermission("MANAGE_MEMBERS"),
  async (c) => {
    const body = await c.req.json();
    const input = renewSchema.parse(body);
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());
    const plans = new PlanRepo(getDb());
    const payments = new PaymentRepo(getDb());
    const history = new HistoryRepo(getDb());

    const member = await members.findByIdInGym(c.req.param("id"), gymId);
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    const plan = await plans.findByIdInGym(input.planId, gymId);
    if (!plan) throw new HTTPException(400, { message: "Invalid plan" });

    const now = new Date();
    const base = member.expiryDate.getTime() > now.getTime() ? member.expiryDate : now;
    const newExpiry = new Date(base.getTime() + plan.durationDays * 86_400_000);

    const currentBalance = member.advanceBalance || 0;
    const advanceUsed = input.useAdvanceBalance
      ? Math.min(currentBalance, plan.price)
      : 0;
    const remaining = plan.price - advanceUsed;
    const amountCollectedNow =
      input.amountPaid !== undefined ? input.amountPaid : remaining;

    const updated = await members.updateInGym(member._id!.toString(), gymId, {
      planId: input.planId as any,
      membershipStartDate: now,
      expiryDate: newExpiry,
      isInactive: false,
      advanceBalance: currentBalance - advanceUsed,
    });
    if (!updated) throw new HTTPException(500, { message: "Renewal failed" });

    if (amountCollectedNow > 0) {
      await payments.create({
        gymId,
        memberId: member._id!,
        amount: amountCollectedNow,
        method: input.paymentMethod,
        paymentDate: now,
        note: input.note || null,
        recordedByUserId: getUserId(c),
      });
    }

    await history.create({
      gymId,
      memberId: member._id!,
      planId: plan._id!,
      planName: plan.name,
      durationDays: plan.durationDays,
      startDate: now,
      expiryDate: newExpiry,
      amountPaid: amountCollectedNow,
    });

    return c.json({
      ok: true,
      member: serializeMember(updated),
      renewedUntil: newExpiry,
      planPrice: plan.price,
      advanceUsed,
      amountCollectedNow,
      newAdvanceBalance: Math.max(0, currentBalance - advanceUsed),
    });
  }
);

// ─── GET payments for a member ─────────────────────────
memberRoutes.get(
  "/:id/payments",
  requireAnyPermission("VIEW_PAYMENTS", "RECORD_PAYMENTS", "MANAGE_MEMBERS"),
  async (c) => {
    const member = await new MemberRepo(getDb()).findByIdInGym(
      c.req.param("id"),
      getGymId(c)
    );
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    const payments = await new PaymentRepo(getDb()).listByMemberInGym(
      member._id!,
      getGymId(c)
    );
    return c.json({
      ok: true,
      payments: payments.map((p) => ({
        id: p._id!.toString(),
        amount: p.amount,
        method: p.method,
        paymentDate: p.paymentDate,
        note: p.note,
      })),
    });
  }
);

// ─── GET history for a member ──────────────────────────
memberRoutes.get(
  "/:id/history",
  requireAnyPermission("VIEW_MEMBERS", "MANAGE_MEMBERS"),
  async (c) => {
    const member = await new MemberRepo(getDb()).findByIdInGym(
      c.req.param("id"),
      getGymId(c)
    );
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    const rows = await new HistoryRepo(getDb()).listByMemberInGym(
      member._id!,
      getGymId(c)
    );
    return c.json({
      ok: true,
      history: rows.map((h) => ({
        id: h._id!.toString(),
        planName: h.planName,
        durationDays: h.durationDays,
        startDate: h.startDate,
        expiryDate: h.expiryDate,
        amountPaid: h.amountPaid,
        createdAt: h.createdAt,
      })),
    });
  }
);
