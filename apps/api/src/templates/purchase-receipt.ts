import { env } from "../env.js";

export function purchaseReceiptEmailHtml(params: {
  gymName: string;
  ownerName: string;
  amountPaise: number;
  paymentId: string;
  orderId: string;
  paidOn: Date;
  licenceExpiresAt: Date;
}): string {
  const paidOn = params.paidOn.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const expiresOn = params.licenceExpiresAt.toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
  const amountINR = `₹${(params.amountPaise / 100).toLocaleString("en-IN")}`;
  const dashboardUrl = `${env.WEB_APP_URL}/app/dashboard`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 32px 24px 32px;">
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:4px;">Palastra</div>
          <div style="font-size:12px;color:#64748b;">Payment receipt</div>
        </td></tr>
        <tr><td style="padding:0 32px 32px 32px;">
          <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:600;color:#0f172a;">Thank you for your purchase</h1>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#334155;">
            Hi ${escapeHtml(params.ownerName)}, your Palastra licence for
            <strong>${escapeHtml(params.gymName)}</strong> is now active.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;">Receipt</td>
              <td style="padding:12px 16px;text-align:right;font-size:12px;color:#64748b;">${escapeHtml(params.paymentId)}</td>
            </tr>
            <tr><td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #f1f5f9;">Item</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f172a;text-align:right;border-top:1px solid #f1f5f9;font-weight:500;">Palastra software licence</td></tr>
            <tr><td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #f1f5f9;">Amount paid</td>
                <td style="padding:12px 16px;font-size:18px;color:#0f172a;text-align:right;border-top:1px solid #f1f5f9;font-weight:700;">${amountINR}</td></tr>
            <tr><td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #f1f5f9;">Paid on</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f172a;text-align:right;border-top:1px solid #f1f5f9;">${escapeHtml(paidOn)}</td></tr>
            <tr><td style="padding:12px 16px;font-size:14px;color:#64748b;border-top:1px solid #f1f5f9;">Maintenance valid until</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f172a;text-align:right;border-top:1px solid #f1f5f9;">${escapeHtml(expiresOn)}</td></tr>
          </table>

          <p style="margin:0 0 16px 0;font-size:13px;line-height:1.6;color:#64748b;">
            Your licence is one-time and lifetime — you own the software. From year 2 onwards, you can optionally pay ₹499/year maintenance to keep receiving updates and support.
          </p>

          <p style="margin:24px 0 0 0;">
            <a href="${dashboardUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
              Go to dashboard →
            </a>
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
            Payment processed securely via Razorpay. Questions? Write to
            <a href="mailto:palastrasupport@gmail.com" style="color:#0f172a;">palastrasupport@gmail.com</a>.
          </p>
          <p style="margin:12px 0 0 0;font-size:11px;color:#94a3b8;">
            Palastra · Margao, Goa, India · Order ${escapeHtml(params.orderId)}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function purchaseReceiptEmailText(params: {
  gymName: string;
  ownerName: string;
  amountPaise: number;
  paymentId: string;
  orderId: string;
  paidOn: Date;
  licenceExpiresAt: Date;
}): string {
  const amountINR = `₹${(params.amountPaise / 100).toLocaleString("en-IN")}`;
  return `Hi ${params.ownerName},

Your Palastra licence for "${params.gymName}" is now active.

RECEIPT
Payment ID: ${params.paymentId}
Order ID: ${params.orderId}
Amount paid: ${amountINR}
Paid on: ${params.paidOn.toLocaleString("en-IN")}
Maintenance valid until: ${params.licenceExpiresAt.toLocaleDateString("en-IN")}

Your licence is one-time and lifetime. From year 2 onwards, you can optionally pay ₹499/year maintenance.

Go to dashboard: ${env.WEB_APP_URL}/app/dashboard

Questions? Write to palastrasupport@gmail.com

— Palastra
Margao, Goa, India`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
