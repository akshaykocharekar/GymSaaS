import { z } from "zod";
import { PLAN_TYPE } from "../constants.js";

// Base object — reusable so we can derive both create (with refinement)
// and update (partial) schemas without losing .partial().
const planBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.nativeEnum(PLAN_TYPE),
  durationDays: z.number().int().positive().max(3650),
  price: z.number().int().nonnegative(),
});

export const createPlanSchema = planBaseSchema.refine(
  (d) => d.type !== PLAN_TYPE.CUSTOM || d.durationDays > 0,
  { message: "Custom plans require durationDays", path: ["durationDays"] }
);
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const updatePlanSchema = planBaseSchema.partial();
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;