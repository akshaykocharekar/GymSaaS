import type { Permission } from "@gymora/shared";
import { PERMISSION_IMPLIES, ROLES } from "@gymora/shared";

/**
 * Checks whether the given role + permissions satisfies the required permission.
 * Owner and Superadmin always pass.
 */
export function roleHasPermission(
  role: string | undefined,
  granted: string[] | undefined,
  required: Permission
): boolean {
  if (!role) return false;
  if (role === ROLES.OWNER || role === ROLES.SUPERADMIN) return true;
  const perms = granted || [];
  if (perms.includes(required)) return true;
  // Check implications
  for (const p of perms) {
    const implied = (PERMISSION_IMPLIES as any)[p] || [];
    if (implied.includes(required)) return true;
  }
  return false;
}

/** Any of the given permissions is satisfied. */
export function roleHasAnyPermission(
  role: string | undefined,
  granted: string[] | undefined,
  required: Permission[]
): boolean {
  return required.some((p) => roleHasPermission(role, granted, p));
}