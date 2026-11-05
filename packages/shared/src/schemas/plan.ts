import { z } from "zod";
import { PLAN_TYPE } from "../constants.js";

const planBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  type: z.nativeEnum(PLAN_TYPE).default(PLAN_TYPE.CUSTOM),
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

export const DEFAULT_PLANS = [
  { name: "Monthly", type: PLAN_TYPE.MONTHLY, durationDays: 30, price: 1000 },
  { name: "Quarterly", type: PLAN_TYPE.QUARTERLY, durationDays: 90, price: 2500 },
  { name: "Half-yearly", type: PLAN_TYPE.HALF_YEARLY, durationDays: 180, price: 4500 },
  { name: "Yearly", type: PLAN_TYPE.YEARLY, durationDays: 365, price: 8000 },
] as const;