import {
  PERMISSIONS,
  PERMISSION_IMPLIES,
  ROLES,
  type Permission,
  type Role,
} from "@gymora/shared";

/**
 * Checks whether a role+permissions combination grants a required permission.
 * OWNER always has all permissions.
 * STAFF needs the exact permission or an implying one.
 */
export function hasPermission(
  role: Role,
  grantedPermissions: Permission[] | undefined,
  required: Permission
): boolean {
  if (role === ROLES.OWNER) return true;
  if (role === ROLES.SUPERADMIN) return true;

  const granted = grantedPermissions || [];

  // Direct hit
  if (granted.includes(required)) return true;

  // Implied: if user has MANAGE_MEMBERS, they implicitly have VIEW_MEMBERS
  for (const g of granted) {
    const implied = PERMISSION_IMPLIES[g] || [];
    if (implied.includes(required)) return true;
  }

  return false;
}

/** Checks any one of the required permissions is satisfied. */
export function hasAnyPermission(
  role: Role,
  grantedPermissions: Permission[] | undefined,
  required: Permission[]
): boolean {
  return required.some((p) => hasPermission(role, grantedPermissions, p));
}

/** All permissions the role effectively has (including implied). */
export function effectivePermissions(
  role: Role,
  granted: Permission[] | undefined
): Permission[] {
  if (role === ROLES.OWNER || role === ROLES.SUPERADMIN) {
    return Object.values(PERMISSIONS);
  }
  const set = new Set<Permission>(granted || []);
  for (const g of granted || []) {
    const implied = PERMISSION_IMPLIES[g] || [];
    for (const imp of implied) set.add(imp);
  }
  return Array.from(set);
}