import { env } from "../env.js";
import { getDb } from "@gymora/db";

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface BrevoSendResponse {
  messageId?: string;
}

/**
 * Send a transactional email via Brevo.
 * If BREVO_API_KEY is missing or send fails, it logs and returns null —
 * it NEVER throws. Email must not break the primary business action
 * (approval, payment verification).
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  if (!env.BREVO_API_KEY) {
    console.warn("[email] BREVO_API_KEY not set — skipping send");
    console.warn("[email] PENDING EMAIL → to:", params.to, "| subject:", params.subject);
    console.warn("[email] PENDING EMAIL → text:", params.textContent || stripHtml(params.htmlContent));
    await queuePendingEmail(params, "BREVO_API_KEY missing");
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.BREVO_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: env.EMAIL_FROM_NAME,
          email: env.EMAIL_FROM,
        },
        to: [{ email: params.to, name: params.toName || params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent || stripHtml(params.htmlContent),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Brevo failed (${res.status}):`, body);
      console.error("[email] PENDING EMAIL → to:", params.to, "| subject:", params.subject);
      console.error("[email] PENDING EMAIL → text:", params.textContent || stripHtml(params.htmlContent));
      await queuePendingEmail(params, `Brevo ${res.status}: ${body.slice(0, 200)}`);
      return false;
    }

    const data = (await res.json()) as BrevoSendResponse;
    console.log(`[email] sent to ${params.to} (messageId: ${data.messageId})`);
    return true;
  } catch (err) {
    console.error("[email] send error:", err);
    console.error("[email] PENDING EMAIL → to:", params.to, "| subject:", params.subject);
    console.error("[email] PENDING EMAIL → text:", params.textContent || stripHtml(params.htmlContent));
    await queuePendingEmail(params, `exception: ${String(err).slice(0, 200)}`);
    return false;
  }
}

async function queuePendingEmail(params: SendEmailParams, reason: string): Promise<void> {
  try {
    const db = getDb();
    await db.collection("pending_emails").insertOne({
      to: params.to,
      toName: params.toName || params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent || stripHtml(params.htmlContent),
      reason,
      sent: false,
      attempts: 0,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("[email] failed to queue pending email:", e);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
