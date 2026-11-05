import { z } from "zod";
import { emailSchema, phoneSchema } from "./auth.js";

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

export const setInactiveSchema = z.object({
  isInactive: z.boolean(),
});
export type SetInactiveInput = z.infer<typeof setInactiveSchema>;

export const renewMemberSchema = z.object({
  planId: z.string().trim().min(1),
  startDate: z.coerce.date(),
  amountPaid: z.number().int().nonnegative().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "OTHER"]).optional(),
});
export type RenewMemberInput = z.infer<typeof renewMemberSchema>;

export const memberListQuerySchema = z.object({
  q: z.string().trim().optional(),
  filter: z.enum(["all", "active", "expired", "inactive", "expiring"]).default("all"),
  expiringInDays: z.coerce.number().int().min(1).max(90).default(7),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;