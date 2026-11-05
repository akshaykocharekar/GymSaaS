import { z } from "zod";
import { emailSchema, passwordSchema, phoneSchema } from "./auth.js";

export const gymRegistrationSchema = z
  .object({
    gymName: z.string().trim().min(2).max(120),
    ownerName: z.string().trim().min(2).max(80),
    email: emailSchema,
    phone: phoneSchema,
    address: z.string().trim().min(5).max(300),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type GymRegistrationInput = z.infer<typeof gymRegistrationSchema>;

export const activationSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^GYM-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Invalid activation code format"),
});
export type ActivationInput = z.infer<typeof activationSchema>;

export const rejectGymSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
export type RejectGymInput = z.infer<typeof rejectGymSchema>;

export const suspendGymSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
export type SuspendGymInput = z.infer<typeof suspendGymSchema>;