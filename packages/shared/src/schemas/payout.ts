import { z } from "zod";

export const createPayoutSchema = z.object({
  trainerId: z.string().trim().min(1),
  amount: z.number().int().positive(),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be YYYY-MM"),
  salaryComponent: z.number().int().nonnegative().default(0),
  commissionComponent: z.number().int().nonnegative().default(0),
  paidOn: z.coerce.date(),
  paymentMethod: z.enum(["CASH", "UPI", "OTHER"]).default("CASH"),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;