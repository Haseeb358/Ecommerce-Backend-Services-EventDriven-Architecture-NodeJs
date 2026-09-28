import { baseLayout, escapeHtml } from './layout.js';

// data: { name, resetUrl, expiresInMinutes }
export function resetPasswordTemplate({ name, resetUrl, expiresInMinutes = 15 }) {
  return {
    subject: 'Reset your password',
    html: baseLayout({
      title: 'Reset your password',
      bodyHtml: `
        <p style="color:#374151;">Hi ${escapeHtml(name)},</p>
        <p style="color:#374151;">Click the button below to choose a new password.</p>
        <p style="margin:24px 0;">
          <a href="${escapeHtml(resetUrl)}"
             style="background:#111827;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
            Reset password
          </a>
        </p>
        <p style="color:#6b7280;">This link expires in ${escapeHtml(expiresInMinutes)} minutes.</p>`,
    }),
    text: `Hi ${name}, reset your password here: ${resetUrl} (expires in ${expiresInMinutes} minutes).`,
  };
}
