import { Hono } from "hono";
import { ObjectId } from "mongodb";
import {
  createTrainerSchema,
  updateTrainerSchema,
  createSessionPackSchema,
  logSessionsSchema,
  MAX_TRAINERS_PER_GYM,
  SESSION_PACK_TYPE,
  SESSION_PACK_TYPE_META,
  COMPENSATION_TYPE,
} from "@gymora/shared";
import { getDb } from "@gymora/db";
import { TrainerRepo } from "../repositories/trainers.js";
import { SessionPackRepo } from "../repositories/sessionPacks.js";
import { MemberRepo } from "../repositories/members.js";
import { PaymentRepo } from "../repositories/payments.js";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { requireParam } from "../lib/params.js";
import { HTTPException } from "hono/http-exception";

export const trainerRoutes = new Hono();

trainerRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}
function getUserId(c: any): ObjectId {
  return new ObjectId(c.get("auth").sub);
}

// ─── List trainers ─────────────────────────────────────
trainerRoutes.get(
  "/",
  requireAnyPermission("VIEW_TRAINERS", "MANAGE_TRAINERS"),
  async (c) => {
    const repo = new TrainerRepo(getDb());
    const gymId = getGymId(c);
    const trainers = await repo.listByGym(gymId, true);
    return c.json({
      ok: true,
      maxAllowed: MAX_TRAINERS_PER_GYM,
      trainers: trainers.map((t) => ({
        id: t._id!.toString(),
        name: t.name,
        phone: t.phone,
        email: t.email,
        joiningDate: t.joiningDate,
        compensationType: t.compensationType,
        commissionPercent: t.commissionPercent,
        monthlySalary: t.monthlySalary,
        isActive: t.isActive,
        notes: t.notes,
      })),
    });
  }
);

// ─── Trainer detail with payout breakdown ──────────────
trainerRoutes.get(
  "/:id",
  requireAnyPermission("VIEW_TRAINERS", "MANAGE_TRAINERS"),
  async (c) => {
    const repo = new TrainerRepo(getDb());
    const gymId = getGymId(c);
    const trainer = await repo.findByIdInGym(requireParam(c, "id"), gymId);
    if (!trainer) throw new HTTPException(404, { message: "Trainer not found" });

    const packRepo = new SessionPackRepo(getDb());
    const packs = await packRepo.listByTrainerInGym(trainer._id!, gymId);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalSales = packs.reduce((s, p) => s + p.pricePaid, 0);
    const monthSales = packs
      .filter((p) => p.purchasedAt >= monthStart)
      .reduce((s, p) => s + p.pricePaid, 0);

    // Commission is only computed if the trainer's comp type includes it
    const includesCommission =
      trainer.compensationType === COMPENSATION_TYPE.COMMISSION_ONLY ||
      trainer.compensationType === COMPENSATION_TYPE.SALARY_PLUS_COMMISSION;
    const includesSalary =
      trainer.compensationType === COMPENSATION_TYPE.SALARY_ONLY ||
      trainer.compensationType === COMPENSATION_TYPE.SALARY_PLUS_COMMISSION;

    const totalCommission = includesCommission
      ? Math.round((totalSales * trainer.commissionPercent) / 100)
      : 0;
    const monthCommission = includesCommission
      ? Math.round((monthSales * trainer.commissionPercent) / 100)
      : 0;

    const monthlySalary = includesSalary ? trainer.monthlySalary : 0;
    const expectedMonthPayout = monthlySalary + monthCommission;

    return c.json({
      ok: true,
      trainer: {
        id: trainer._id!.toString(),
        name: trainer.name,
        phone: trainer.phone,
        email: trainer.email,
        joiningDate: trainer.joiningDate,
        compensationType: trainer.compensationType,
        commissionPercent: trainer.commissionPercent,
        monthlySalary: trainer.monthlySalary,
        isActive: trainer.isActive,
        notes: trainer.notes,
      },
      earnings: {
        // Sales figures always shown
        totalSales,
        monthSales,
        // Commission (0 if not applicable)
        commission: totalCommission,
        monthCommission,
        // Salary (0 if not applicable)
        monthlySalary,
        // Combined expectation for this month
        expectedMonthPayout,
      },
      recentPacks: packs.slice(0, 10).map((p) => ({
        id: p._id!.toString(),
        memberId: p.memberId.toString(),
        type: p.type,
        sessionsPurchased: p.sessionsPurchased,
        sessionsUsed: p.sessionsUsed,
        pricePaid: p.pricePaid,
        purchasedAt: p.purchasedAt,
      })),
    });
  }
);

// ─── Create trainer ────────────────────────────────────
trainerRoutes.post(
  "/",
  requireAnyPermission("MANAGE_TRAINERS"),
  async (c) => {
    const body = await c.req.json();
    const input = createTrainerSchema.parse(body);
    const gymId = getGymId(c);
    const repo = new TrainerRepo(getDb());

    const count = await repo.countByGym(gymId);
    if (count >= MAX_TRAINERS_PER_GYM) {
      throw new HTTPException(409, {
        message: `Only ${MAX_TRAINERS_PER_GYM} trainers allowed per gym`,
      });
    }

    const res = await repo.create(gymId, input);
    return c.json({ ok: true, id: res.insertedId.toString() }, 201);
  }
);

// ─── Update trainer ────────────────────────────────────
trainerRoutes.patch(
  "/:id",
  requireAnyPermission("MANAGE_TRAINERS"),
  async (c) => {
    const body = await c.req.json();
    const patch = updateTrainerSchema.parse(body);
    const repo = new TrainerRepo(getDb());
    const updated = await repo.updateInGym(
      requireParam(c, "id"),
      getGymId(c),
      patch
    );
    if (!updated) throw new HTTPException(404, { message: "Trainer not found" });
    return c.json({ ok: true });
  }
);

// ─── Sell session pack ─────────────────────────────────
trainerRoutes.post(
  "/session-packs",
  requireAnyPermission("MANAGE_TRAINERS"),
  async (c) => {
    const body = await c.req.json();
    const input = createSessionPackSchema.parse(body);
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());
    const packs = new SessionPackRepo(getDb());
    const payments = new PaymentRepo(getDb());

    const member = await members.findByIdInGym(input.memberId, gymId);
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    let trainerId: ObjectId | null = null;
    if (input.trainerId) {
      const trainers = new TrainerRepo(getDb());
      const trainer = await trainers.findByIdInGym(input.trainerId, gymId);
      if (!trainer) {
        throw new HTTPException(400, { message: "Invalid trainer" });
      }
      trainerId = trainer._id!;
    }

    const packRes = await packs.create({
      gymId,
      memberId: member._id!,
      trainerId,
      type: input.type,
      sessionsPurchased: input.sessionsPurchased,
      sessionsUsed: 0,
      pricePaid: input.pricePaid,
      paymentMethod: input.paymentMethod,
      purchasedAt: input.purchasedAt,
      expiresAt: input.expiresAt || null,
      notes: input.notes || null,
    });

    if (input.pricePaid > 0) {
      await payments.create({
        gymId,
        memberId: member._id!,
        amount: input.pricePaid,
        method: input.paymentMethod,
        paymentDate: input.purchasedAt,
        note: `Session pack: ${SESSION_PACK_TYPE_META[input.type].label} × ${input.sessionsPurchased}`,
        recordedByUserId: getUserId(c),
      });
    }

    return c.json(
      { ok: true, packId: packRes.insertedId.toString() },
      201
    );
  }
);

// ─── Log sessions used ─────────────────────────────────
trainerRoutes.post(
  "/session-packs/:id/log",
  requireAnyPermission("MANAGE_TRAINERS"),
  async (c) => {
    const body = await c.req.json();
    const input = logSessionsSchema.parse(body);
    const gymId = getGymId(c);
    const packs = new SessionPackRepo(getDb());

    const pack = await packs.findByIdInGym(requireParam(c, "id"), gymId);
    if (!pack) throw new HTTPException(404, { message: "Session pack not found" });

    // Check expiry
    if (pack.expiresAt && new Date(pack.expiresAt) < new Date()) {
      throw new HTTPException(400, {
        message: "This session pack has expired",
      });
    }

    const remaining = pack.sessionsPurchased - pack.sessionsUsed;
    if (input.count > remaining) {
      throw new HTTPException(400, {
        message: `Cannot log ${input.count} sessions — only ${remaining} remaining`,
      });
    }

    const updated = await packs.incrementSessionsUsed(
      pack._id!,
      gymId,
      input.count
    );

    return c.json({
      ok: true,
      sessionsUsed: updated?.sessionsUsed,
      remaining: (updated?.sessionsPurchased || 0) - (updated?.sessionsUsed || 0),
    });
  }
);

// ─── List session packs for a member ───────────────────
trainerRoutes.get(
  "/session-packs/member/:memberId",
  requireAnyPermission("VIEW_TRAINERS", "VIEW_MEMBERS", "MANAGE_MEMBERS"),
  async (c) => {
    const gymId = getGymId(c);
    const members = new MemberRepo(getDb());
    const member = await members.findByIdInGym(requireParam(c, "memberId"), gymId);
    if (!member) throw new HTTPException(404, { message: "Member not found" });

    const packs = await new SessionPackRepo(getDb()).listAllByMember(
      member._id!,
      gymId
    );
    return c.json({
      ok: true,
      packs: packs.map((p) => ({
        id: p._id!.toString(),
        trainerId: p.trainerId ? p.trainerId.toString() : null,
        type: p.type,
        typeLabel: SESSION_PACK_TYPE_META[p.type].label,
        sessionsPurchased: p.sessionsPurchased,
        sessionsUsed: p.sessionsUsed,
        remaining: p.sessionsPurchased - p.sessionsUsed,
        pricePaid: p.pricePaid,
        purchasedAt: p.purchasedAt,
        expiresAt: p.expiresAt,
      })),
    });
  }
);

// ─── Session pack types (for UI dropdowns) ─────────────
trainerRoutes.get("/types", async (c) => {
  return c.json({
    ok: true,
    types: Object.entries(SESSION_PACK_TYPE_META).map(([key, meta]) => ({
      value: key,
      label: meta.label,
    })),
  });
});