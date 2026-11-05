import type { WhatsAppTemplateKind } from "./constants.js";

export interface TemplateVariable {
  key: string;
  label: string;
}

export interface WhatsAppTemplate {
  kind: WhatsAppTemplateKind;
  label: string;
  description: string;
  body: string;
  variables: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    kind: "WELCOME",
    label: "Welcome",
    description: "Sent when a new member joins",
    body:
      "Hi {{member_name}} 👋\n\nWelcome to {{gym_name}}! We're excited to have you with us. If you need anything, just reply here.\n\nLet's get stronger together 💪",
    variables: ["member_name", "gym_name"],
  },
  {
    kind: "PAYMENT_REMINDER",
    label: "Payment reminder",
    description: "Politely remind about pending dues",
    body:
      "Hi {{member_name}},\n\nA quick reminder that your payment of ₹{{amount}} for {{gym_name}} is due on {{due_date}}.\n\nKindly pay at your earliest convenience. Thank you! 🙏",
    variables: ["member_name", "gym_name", "amount", "due_date"],
  },
  {
    kind: "PAYMENT_CONFIRMATION",
    label: "Payment received",
    description: "Confirm a payment was received",
    body:
      "Hi {{member_name}},\n\nWe've received your payment of ₹{{amount}} at {{gym_name}}. Thank you! 🙏\n\nSee you at the gym soon 💪",
    variables: ["member_name", "gym_name", "amount"],
  },
  {
    kind: "EXPIRY_REMINDER",
    label: "Expiry reminder",
    description: "Membership expiring soon",
    body:
      "Hi {{member_name}},\n\nYour membership at {{gym_name}} expires on {{expiry_date}}. Renew now to keep your fitness streak going! 💪\n\nLet us know if you have any questions.",
    variables: ["member_name", "gym_name", "expiry_date"],
  },
  {
    kind: "RENEWAL_REMINDER",
    label: "Renewal reminder",
    description: "Membership has expired — win them back",
    body:
      "Hi {{member_name}},\n\nWe miss you at {{gym_name}}! Your membership expired on {{expiry_date}}. Come back and pick up where you left off 🏋️\n\nReply to renew or visit us at the gym.",
    variables: ["member_name", "gym_name", "expiry_date"],
  },
];

export interface TemplateContext {
  member_name?: string;
  gym_name?: string;
  amount?: number | string;
  due_date?: string;
  expiry_date?: string;
}

export function renderTemplate(
  body: string,
  context: TemplateContext
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = context[key as keyof TemplateContext];
    if (value === undefined || value === null) return `{{${key}}}`;
    return String(value);
  });
}

/** Normalizes an Indian phone to wa.me format (91XXXXXXXXXX). */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const num = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function formatDateIndian(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
