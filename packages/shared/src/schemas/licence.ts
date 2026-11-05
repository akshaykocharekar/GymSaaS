import { z } from "zod";
import { LICENCE_PAYMENT_TYPE } from "../constants.js";

export const createLicenceOrderSchema = z.object({
  type: z.nativeEnum(LICENCE_PAYMENT_TYPE),
});
export type CreateLicenceOrderInput = z.infer<typeof createLicenceOrderSchema>;

export const verifyLicencePaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
export type VerifyLicencePaymentInput = z.infer<
  typeof verifyLicencePaymentSchema
>;