import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { createPlanSchema, updatePlanSchema, ROLES } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { PlanRepo } from "../repositories/plans.js";
import {
  requireAuth,
  requireAnyPermission,
} from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const planRoutes = new Hono();

planRoutes.use("*", requireAuth);

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

// GET: VIEW_PLANS (or MANAGE_PLANS implies VIEW_PLANS)
planRoutes.get("/", requireAnyPermission("VIEW_PLANS", "MANAGE_PLANS"), async (c) => {
  const plans = new PlanRepo(getDb());
  const docs = await plans.listByGym(getGymId(c), true);
  return c.json({
    ok: true,
    plans: docs.map((p) => ({
      id: p._id!.toString(),
      name: p.name,
      type: p.type,
      durationDays: p.durationDays,
      price: p.price,
      isActive: p.isActive,
    })),
  });
});

// POST: MANAGE_PLANS
planRoutes.post("/", requireAnyPermission("MANAGE_PLANS"), async (c) => {
  const body = await c.req.json();
  const input = createPlanSchema.parse(body);
  const plans = new PlanRepo(getDb());
  const res = await plans.create(getGymId(c), input);
  return c.json({ ok: true, id: res.insertedId.toString() }, 201);
});

// PATCH: MANAGE_PLANS
planRoutes.patch("/:id", requireAnyPermission("MANAGE_PLANS"), async (c) => {
  const body = await c.req.json();
  const patch = updatePlanSchema.parse(body);
  const plans = new PlanRepo(getDb());
  const updated = await plans.updateInGym(c.req.param("id"), getGymId(c), patch);
  if (!updated) throw new HTTPException(404, { message: "Plan not found" });
  return c.json({ ok: true });
});

// DELETE: MANAGE_PLANS
planRoutes.delete("/:id", requireAnyPermission("MANAGE_PLANS"), async (c) => {
  const plans = new PlanRepo(getDb());
  await plans.deactivateInGym(c.req.param("id"), getGymId(c));
  return c.json({ ok: true });
});