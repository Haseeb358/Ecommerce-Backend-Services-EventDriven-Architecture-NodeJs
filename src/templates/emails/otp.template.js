import { baseLayout, escapeHtml } from './layout.js';

// data: { name, otp, expiresInMinutes }
export function otpTemplate({ name, otp, expiresInMinutes = 10 }) {
  return {
    subject: 'Your verification code',
    html: baseLayout({
      title: 'Verify your email',
      bodyHtml: `
        <p style="color:#374151;">Hi ${escapeHtml(name)},</p>
        <p style="color:#374151;">Use this code to verify your email:</p>
        <p style="font-size:32px;letter-spacing:6px;font-weight:bold;color:#111827;margin:16px 0;">
          ${escapeHtml(otp)}
        </p>
        <p style="color:#6b7280;">This code expires in ${escapeHtml(expiresInMinutes)} minutes.</p>`,
    }),
    text: `Hi ${name}, your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
  };
}
