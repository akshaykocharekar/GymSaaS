import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { createPlanSchema, updatePlanSchema, ROLES } from "@gymora/shared";
import { getDb } from "@gymora/db";
import { PlanRepo } from "../repositories/plans.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { HTTPException } from "hono/http-exception";

export const planRoutes = new Hono();

planRoutes.use("*", requireAuth, requireRole(ROLES.OWNER, ROLES.STAFF));

function getGymId(c: any): ObjectId {
  const auth = c.get("auth");
  if (!auth?.gymId) throw new HTTPException(403, { message: "No tenant" });
  return new ObjectId(auth.gymId);
}

planRoutes.get("/", async (c) => {
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

planRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const input = createPlanSchema.parse(body);
  const plans = new PlanRepo(getDb());
  const res = await plans.create(getGymId(c), input);
  return c.json({ ok: true, id: res.insertedId.toString() }, 201);
});

planRoutes.patch("/:id", async (c) => {
  const body = await c.req.json();
  const patch = updatePlanSchema.parse(body);
  const plans = new PlanRepo(getDb());
  const updated = await plans.updateInGym(c.req.param("id"), getGymId(c), patch);
  if (!updated) throw new HTTPException(404, { message: "Plan not found" });
  return c.json({ ok: true });
});

planRoutes.delete("/:id", async (c) => {
  const plans = new PlanRepo(getDb());
  await plans.deactivateInGym(c.req.param("id"), getGymId(c));
  return c.json({ ok: true });
});