import { z } from "zod";
import { ROLES, PERMISSIONS } from "../constants.js";

export const emailSchema = z.string().trim().toLowerCase().email("Invalid email");
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const staffPermissionsSchema = z.array(z.nativeEnum(PERMISSIONS)).default([]);

export const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  permissions: staffPermissionsSchema,
});
export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const roleSchema = z.nativeEnum(ROLES);