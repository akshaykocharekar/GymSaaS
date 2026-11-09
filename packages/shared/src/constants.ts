// ─── Gym lifecycle statuses ──────────────────────────────
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

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  OWNER: "OWNER",
  STAFF: "STAFF",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Staff permissions (v1: 10 fine-grained) ────────────
export const PERMISSIONS = {
  VIEW_MEMBERS: "VIEW_MEMBERS",
  MANAGE_MEMBERS: "MANAGE_MEMBERS",
  VIEW_PAYMENTS: "VIEW_PAYMENTS",
  RECORD_PAYMENTS: "RECORD_PAYMENTS",
  VIEW_EXPIRIES: "VIEW_EXPIRIES",
  VIEW_REPORTS: "VIEW_REPORTS",
  VIEW_PLANS: "VIEW_PLANS",
  MANAGE_PLANS: "MANAGE_PLANS",
  VIEW_TRAINERS: "VIEW_TRAINERS",
  MANAGE_TRAINERS: "MANAGE_TRAINERS",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_IMPLIES: Record<Permission, Permission[]> = {
  VIEW_MEMBERS: [],
  MANAGE_MEMBERS: ["VIEW_MEMBERS"],
  VIEW_PAYMENTS: [],
  RECORD_PAYMENTS: ["VIEW_PAYMENTS"],
  VIEW_EXPIRIES: ["VIEW_MEMBERS"],
  VIEW_REPORTS: [],
  VIEW_PLANS: [],
  MANAGE_PLANS: ["VIEW_PLANS"],
  VIEW_TRAINERS: ["VIEW_MEMBERS"],
  MANAGE_TRAINERS: ["VIEW_TRAINERS"],
};

export const PERMISSION_META: Record<
  Permission,
  { label: string; description: string; group: string }
> = {
  VIEW_MEMBERS: {
    label: "View members",
    description: "See the member list and member details",
    group: "Members",
  },
  MANAGE_MEMBERS: {
    label: "Manage members",
    description: "Add, edit, deactivate, and renew members",
    group: "Members",
  },
  VIEW_PAYMENTS: {
    label: "View payments",
    description: "See payment history and dues",
    group: "Payments",
  },
  RECORD_PAYMENTS: {
    label: "Record payments",
    description: "Log payments, advances, and renewals",
    group: "Payments",
  },
  VIEW_EXPIRIES: {
    label: "View expiries",
    description: "See who's expiring soon and send WhatsApp reminders",
    group: "Members",
  },
  VIEW_REPORTS: {
    label: "View reports",
    description: "See revenue, dues, plan mix, renewals",
    group: "Reports",
  },
  VIEW_PLANS: {
    label: "View plans",
    description: "See membership plans",
    group: "Plans",
  },
  MANAGE_PLANS: {
    label: "Manage plans",
    description: "Create, edit, and deactivate membership plans",
    group: "Plans",
  },
  VIEW_TRAINERS: {
    label: "View trainers",
    description: "See trainers and their session sales",
    group: "Trainers",
  },
  MANAGE_TRAINERS: {
    label: "Manage trainers",
    description: "Add/edit trainers, assign to members, sell session packs",
    group: "Trainers",
  },
};

// ─── Member statuses ────────────────────────────────────
export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  INACTIVE: "INACTIVE",
} as const;
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];

export const PLAN_TYPE = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  HALF_YEARLY: "HALF_YEARLY",
  YEARLY: "YEARLY",
  CUSTOM: "CUSTOM",
} as const;
export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

export const PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  OTHER: "OTHER",
} as const;
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// ─── Session pack types ─────────────────────────────────
export const SESSION_PACK_TYPE = {
  PT: "PT", // Personal training
  YOGA: "YOGA",
  ZUMBA: "ZUMBA",
  CROSSFIT: "CROSSFIT",
  OTHER: "OTHER",
} as const;
export type SessionPackType =
  (typeof SESSION_PACK_TYPE)[keyof typeof SESSION_PACK_TYPE];

export const SESSION_PACK_TYPE_META: Record<
  SessionPackType,
  { label: string }
> = {
  PT: { label: "Personal Training" },
  YOGA: { label: "Yoga" },
  ZUMBA: { label: "Zumba" },
  CROSSFIT: { label: "CrossFit" },
  OTHER: { label: "Other" },
};

export const COMPENSATION_TYPE = {
  COMMISSION_ONLY: "COMMISSION_ONLY",
  SALARY_ONLY: "SALARY_ONLY",
  SALARY_PLUS_COMMISSION: "SALARY_PLUS_COMMISSION",
} as const;
export type CompensationType =
  (typeof COMPENSATION_TYPE)[keyof typeof COMPENSATION_TYPE];

export const COMPENSATION_TYPE_META: Record<
  CompensationType,
  { label: string; description: string }
> = {
  COMMISSION_ONLY: {
    label: "Commission only",
    description: "Paid a % of each PT/class pack they sell",
  },
  SALARY_ONLY: {
    label: "Salary only",
    description: "Fixed monthly salary, no commission on sales",
  },
  SALARY_PLUS_COMMISSION: {
    label: "Salary + commission",
    description: "Fixed monthly salary plus a % of pack sales",
  },
};

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

// ─── Business constants ─────────────────────────────────
export const TRIAL_DAYS = 30;
export const LICENCE_PRICE_PAISE = 199_900;
export const MAINTENANCE_PRICE_PAISE = 49_900;
export const MAINTENANCE_DAYS = 365;
export const MAINTENANCE_RENEWAL_WINDOW_DAYS = 30;

export const MAX_MEMBERS_PER_GYM = 500;
export const MAX_MEMBERS_WARN_THRESHOLD = 450;
export const MAX_STAFF_PER_GYM = 10;
export const MAX_TRAINERS_PER_GYM = 20;

export const ACTIVATION_CODE_PREFIX = "GYM";
export const ACTIVATION_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ACTIVATION_CODE_GROUPS = 2;
export const ACTIVATION_CODE_GROUP_LEN = 4;
export const ACTIVATION_CODE_TTL_HOURS = 72;

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