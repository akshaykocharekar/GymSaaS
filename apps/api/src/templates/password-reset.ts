import { env } from "../env.js";

export function passwordResetEmailHtml(params: {
  gymName: string;
  ownerName: string;
  resetUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 32px 24px 32px;">
          <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:4px;">Palastra</div>
          <div style="font-size:12px;color:#64748b;">Password reset request</div>
        </td></tr>
        <tr><td style="padding:0 32px 32px 32px;">
          <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#0f172a;">Reset your password</h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#334155;">
            Hi ${escapeHtml(params.ownerName)},
          </p>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#334155;">
            We received a request to reset the password for your Palastra account at
            <strong>${escapeHtml(params.gymName)}</strong>. Click the button below to set a new password.
          </p>
          <p style="margin:24px 0;">
            <a href="${params.resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
              Reset my password →
            </a>
          </p>
          <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#64748b;">
            This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email — your password won't be changed.
          </p>
          <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">
            Or paste this link into your browser:<br/>
            <span style="color:#64748b;word-break:break-all;font-size:11px;">${params.resetUrl}</span>
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
            Need help? Reply to this email or write to
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

export function passwordResetEmailText(params: {
  gymName: string;
  ownerName: string;
  resetUrl: string;
}): string {
  return `Hi ${params.ownerName},

We received a request to reset the password for your Palastra account at "${params.gymName}".

Reset your password here (expires in 1 hour):
${params.resetUrl}

If you didn't request this, ignore this email.

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
