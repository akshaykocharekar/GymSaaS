import { z } from "zod";
import { SESSION_PACK_TYPE, COMPENSATION_TYPE } from "../constants.js";

export const createSessionPackSchema = z.object({
  memberId: z.string().trim().min(1),
  trainerId: z.string().trim().optional().or(z.literal("")),
  type: z.nativeEnum(SESSION_PACK_TYPE),
  sessionsPurchased: z.number().int().positive().max(500),
  pricePaid: z.number().int().nonnegative(),
  paymentMethod: z.enum(["CASH", "UPI", "OTHER"]).default("CASH"),
  purchasedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});
export type CreateSessionPackInput = z.infer<typeof createSessionPackSchema>;

export const logSessionsSchema = z.object({
  count: z.number().int().positive().max(50),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});
export type LogSessionsInput = z.infer<typeof logSessionsSchema>;

export const createTrainerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z.string().trim().email().optional().or(z.literal("")),
    joiningDate: z.coerce.date(),
    compensationType: z
      .nativeEnum(COMPENSATION_TYPE)
      .default(COMPENSATION_TYPE.COMMISSION_ONLY),
    commissionPercent: z.number().min(0).max(100).default(0),
    monthlySalary: z.number().int().nonnegative().default(0),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      d.compensationType === COMPENSATION_TYPE.SALARY_ONLY ||
      d.compensationType === COMPENSATION_TYPE.SALARY_PLUS_COMMISSION ||
      d.commissionPercent > 0,
    { message: "Commission-only trainers need a commission %", path: ["commissionPercent"] }
  )
  .refine(
    (d) =>
      d.compensationType === COMPENSATION_TYPE.COMMISSION_ONLY ||
      d.monthlySalary > 0,
    { message: "Salaried trainers need a monthly salary", path: ["monthlySalary"] }
  );
export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;

export const updateTrainerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  compensationType: z.nativeEnum(COMPENSATION_TYPE).optional(),
  commissionPercent: z.number().min(0).max(100).optional(),
  monthlySalary: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>;