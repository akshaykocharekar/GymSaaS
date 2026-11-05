// ─── Gym lifecycle statuses (PRD §6) ────────────────────
export const GYM_STATUS = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  ACTIVE_TRIAL: "ACTIVE_TRIAL",
  TRIAL_EXPIRED: "TRIAL_EXPIRED",
  ACTIVE_PAID: "ACTIVE_PAID",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type GymStatus = (typeof GYM_STATUS)[keyof typeof GYM_STATUS];

// ─── User roles (PRD §9) ────────────────────────────────
export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  OWNER: "OWNER",
  STAFF: "STAFF",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Staff permissions (locked for v1) ──────────────────
export const PERMISSIONS = {
  MANAGE_MEMBERS: "MANAGE_MEMBERS",
  RECORD_PAYMENTS: "RECORD_PAYMENTS",
  VIEW_REPORTS: "VIEW_REPORTS",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Member statuses ────────────────────────────────────
export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  INACTIVE: "INACTIVE",
} as const;
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

// ─── Membership plan types ──────────────────────────────
export const PLAN_TYPE = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
} as const;
export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

// ─── Manual payment methods ─────────────────────────────
export const PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// ─── Gymora licence payment types / statuses ────────────
export const LICENCE_PAYMENT_TYPE = {
  SOFTWARE_PURCHASE: "SOFTWARE_PURCHASE",
  MAINTENANCE: "MAINTENANCE",
} as const;
export type LicencePaymentType =
  (typeof LICENCE_PAYMENT_TYPE)[keyof typeof LICENCE_PAYMENT_TYPE];

export const LICENCE_PAYMENT_STATUS = {
  CREATED: "CREATED",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;
export type LicencePaymentStatus =
  (typeof LICENCE_PAYMENT_STATUS)[keyof typeof LICENCE_PAYMENT_STATUS];

// ─── Business constants (PRD §2, §6) ────────────────────
export const TRIAL_DAYS = 30;
export const LICENCE_PRICE_PAISE = 199_900; // ₹1,999 in paise
export const MAINTENANCE_PRICE_PAISE = 19_900; // ₹199 in paise
export const MAINTENANCE_DAYS = 365;
export const MAX_MEMBERS_PER_GYM = 500; // fair-use soft cap
export const MAX_MEMBERS_WARN_THRESHOLD = 450;

// ─── Activation code ────────────────────────────────────
export const ACTIVATION_CODE_PREFIX = "GYM";
export const ACTIVATION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
export const ACTIVATION_CODE_GROUPS = 2;
export const ACTIVATION_CODE_GROUP_LEN = 4;
export const ACTIVATION_CODE_TTL_HOURS = 72;

// ─── WhatsApp template variables (PRD §11) ──────────────
export const WHATSAPP_VARIABLES = [
  "member_name",
  "gym_name",
  "amount",
  "due_date",
  "expiry_date",
] as const;
export type WhatsAppVariable = (typeof WHATSAPP_VARIABLES)[number];

export const WHATSAPP_TEMPLATE_KINDS = {
  WELCOME: "WELCOME",
  PAYMENT_REMINDER: "PAYMENT_REMINDER",
  PAYMENT_CONFIRMATION: "PAYMENT_CONFIRMATION",
  EXPIRY_REMINDER: "EXPIRY_REMINDER",
  RENEWAL_REMINDER: "RENEWAL_REMINDER",
} as const;
export type WhatsAppTemplateKind =
  (typeof WHATSAPP_TEMPLATE_KINDS)[keyof typeof WHATSAPP_TEMPLATE_KINDS];