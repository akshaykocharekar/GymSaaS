export const COLLECTIONS = {
  GYMS: "gyms",
  USERS: "users",
  MEMBERS: "members",
  MEMBERSHIP_PLANS: "membership_plans",
  PAYMENTS: "payments",
  MEMBERSHIP_HISTORY: "membership_history",
  LICENCE_PAYMENTS: "licence_payments",
  WEBHOOK_EVENTS: "webhook_events",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];