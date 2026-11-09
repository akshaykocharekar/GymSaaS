import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { createPayoutSchema } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { PayoutRepo } from "../repositories/payouts.js";
import { TrainerRepo } from "../repositories/trainers.js";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { requireParam } from "../lib/params.js";
import { HTTPException } from "hono/http-exception";

export const payoutRoutes = new Hono();

payoutRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

// Create a payout
payoutRoutes.post(
  "/",
  requireAnyPermission("MANAGE_TRAINERS"),
  async (c) => {
    const body = await c.req.json();
    const input = createPayoutSchema.parse(body);
    const gymId = getGymId(c);

    const trainers = new TrainerRepo(getDb());
    const trainer = await trainers.findByIdInGym(input.trainerId, gymId);
    if (!trainer) throw new HTTPException(404, { message: "Trainer not found" });

    const payouts = new PayoutRepo(getDb());
    const res = await payouts.create({
      gymId,
      trainerId: trainer._id!,
      amount: input.amount,
      period: input.period,
      salaryComponent: input.salaryComponent,
      commissionComponent: input.commissionComponent,
      paidOn: input.paidOn,
      paymentMethod: input.paymentMethod,
      notes: input.notes || null,
    });

    return c.json({ ok: true, id: res.insertedId.toString() }, 201);
  }
);

// List payouts for a specific trainer
payoutRoutes.get(
  "/trainer/:trainerId",
  requireAnyPermission("VIEW_TRAINERS", "MANAGE_TRAINERS"),
  async (c) => {
    const gymId = getGymId(c);
    const trainers = new TrainerRepo(getDb());
    const trainer = await trainers.findByIdInGym(
      requireParam(c, "trainerId"),
      gymId
    );
    if (!trainer) throw new HTTPException(404, { message: "Trainer not found" });

    const payouts = new PayoutRepo(getDb());
    const rows = await payouts.listByTrainer(trainer._id!, gymId);

    return c.json({
      ok: true,
      payouts: rows.map((p) => ({
        id: p._id!.toString(),
        amount: p.amount,
        period: p.period,
        salaryComponent: p.salaryComponent,
        commissionComponent: p.commissionComponent,
        paidOn: p.paidOn,
        paymentMethod: p.paymentMethod,
        notes: p.notes,
      })),
    });
  }
);