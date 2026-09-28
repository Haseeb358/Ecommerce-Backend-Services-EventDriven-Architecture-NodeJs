import { baseLayout, escapeHtml } from './layout.js';

// data: { name, orderId, items: [{ name, quantity, price }], total, currency }
export function orderPlacedTemplate({ name, orderId, items = [], total, currency = 'USD' }) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#374151;">${escapeHtml(item.name)} × ${escapeHtml(item.quantity)}</td>
          <td style="padding:8px 0;color:#374151;text-align:right;">${escapeHtml(item.price)} ${escapeHtml(currency)}</td>
        </tr>`
    )
    .join('');

  return {
    subject: `Order confirmation #${orderId}`,
    html: baseLayout({
      title: 'Thanks for your order!',
      bodyHtml: `
        <p style="color:#374151;">Hi ${escapeHtml(name)}, we received your order <b>#${escapeHtml(orderId)}</b>.</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               style="border-top:1px solid #e5e7eb;margin-top:16px;">
          ${rows}
          <tr>
            <td style="padding-top:12px;border-top:1px solid #e5e7eb;"><b>Total</b></td>
            <td style="padding-top:12px;border-top:1px solid #e5e7eb;text-align:right;">
              <b>${escapeHtml(total)} ${escapeHtml(currency)}</b>
            </td>
          </tr>
        </table>`,
    }),
    text: `Hi ${name}, we received your order #${orderId}. Total: ${total} ${currency}.`,
  };
}
