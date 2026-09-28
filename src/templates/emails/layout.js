/**
 * Escape any user-controlled value before putting it in HTML.
 * A user could register with the name "<script>..." — never trust it.
 */
export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shared wrapper so every email looks consistent. */
export function baseLayout({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0"
                 style="background:#ffffff;border-radius:8px;padding:32px;">
            <tr><td>
              <h2 style="margin:0 0 16px;color:#111827;">${escapeHtml(title)}</h2>
              ${bodyHtml}
              <p style="margin:32px 0 0;color:#9ca3af;font-size:12px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
