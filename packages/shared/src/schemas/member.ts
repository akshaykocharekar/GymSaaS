import { z } from "zod";
import { emailSchema, phoneSchema } from "./auth.js";
import { MEMBER_STATUS } from "../constants.js";

export const createMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  joiningDate: z.coerce.date(),
  planId: z.string().trim().min(1, "Plan is required"),
  membershipStartDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = createMemberSchema.partial();
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const updateMemberStatusSchema = z.object({
  status: z.nativeEnum(MEMBER_STATUS),
});

export const renewMemberSchema = z.object({
  planId: z.string().trim().min(1),
  startDate: z.coerce.date(),
  amountPaid: z.number().int().nonnegative().optional(),
});
export type RenewMemberInput = z.infer<typeof renewMemberSchema>;