import { env } from "../env.js";

export function activationCodeEmailHtml(params: {
  gymName: string;
  ownerName: string;
  code: string;
  expiresAt: Date;
}): string {
  const expiry = params.expiresAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const activateUrl = `${env.WEB_APP_URL}/activate`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 32px 24px 32px;">
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:4px;">Palastra</div>
          <div style="font-size:12px;color:#64748b;">Gym management for independent gyms</div>
        </td></tr>
        <tr><td style="padding:0 32px 32px 32px;">
          <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#0f172a;">Your gym is approved 🎉</h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#334155;">
            Hi ${escapeHtml(params.ownerName)},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#334155;">
            <strong>${escapeHtml(params.gymName)}</strong> has been approved. Use the activation code below to start your 30-day free trial.
          </p>
          <div style="margin:24px 0;padding:24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:center;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:8px;">Activation Code</div>
            <div style="font-family:'SF Mono',Monaco,Consolas,monospace;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:0.05em;">${escapeHtml(params.code)}</div>
          </div>
          <p style="margin:0 0 16px 0;font-size:13px;color:#64748b;">
            This code expires on <strong>${escapeHtml(expiry)}</strong> and can only be used once.
          </p>
          <p style="margin:24px 0 0 0;">
            <a href="${activateUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
              Activate my gym →
            </a>
          </p>
          <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">
            Or paste this link into your browser:<br/>
            <span style="color:#64748b;word-break:break-all;">${activateUrl}</span>
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
            Questions? Reply to this email or write to
            <a href="mailto:palastrasupport@gmail.com" style="color:#0f172a;">palastrasupport@gmail.com</a>.
          </p>
          <p style="margin:12px 0 0 0;font-size:11px;color:#94a3b8;">
            Palastra · Margao, Goa, India
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function activationCodeEmailText(params: {
  gymName: string;
  ownerName: string;
  code: string;
  expiresAt: Date;
}): string {
  return `Hi ${params.ownerName},

Your gym "${params.gymName}" has been approved.

Activation code: ${params.code}

This code expires on ${params.expiresAt.toLocaleString("en-IN")} and can only be used once.

Activate here: ${env.WEB_APP_URL}/activate

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
