import { z } from "zod";
import { PAYMENT_METHOD } from "../constants.js";

export const recordPaymentSchema = z.object({
  memberId: z.string().trim().min(1),
  amount: z.number().int().positive(),
  method: z.nativeEnum(PAYMENT_METHOD),
  paymentDate: z.coerce.date(),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;