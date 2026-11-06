import crypto from "node:crypto";
import { env } from "../env.js";

const RZP_BASE = "https://api.razorpay.com/v1";

function authHeader(): string {
  const pair = `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(pair).toString("base64")}`;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
}

export async function createRazorpayOrder(params: {
  amount: number; // in paise
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RZP_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes || {},
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order failed: ${res.status} ${body}`);
  }
  return (await res.json()) as RazorpayOrder;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string; // "captured" | "failed" | ...
  order_id: string;
  method: string;
  created_at: number;
}

export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayPayment> {
  const res = await fetch(`${RZP_BASE}/payments/${paymentId}`, {
    method: "GET",
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    throw new Error(`Razorpay fetch payment failed: ${res.status}`);
  }
  return (await res.json()) as RazorpayPayment;
}

/** Verifies the client-side success signature (order_id|payment_id). */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  // Constant-time compare
  if (expected.length !== params.signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(params.signature)
  );
}

/** Verifies the webhook signature header. */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(params.rawBody)
    .digest("hex");
  if (expected.length !== params.signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(params.signature)
  );
}