import { EVENTS } from '../eventTypes.js';

/**
 * Email listeners: "when X happens, send email Y".
 * Services only publish events; they never import EmailService.
 *
 * SECURITY: never log these payloads — they contain OTPs / reset links.
 *
 * Payload shapes (the publisher must send exactly these):
 *   OTP_REQUESTED             { email, name, otp, expiresInMinutes }
 *   PASSWORD_RESET_REQUESTED  { email, name, resetUrl, expiresInMinutes }
 *   ORDER_CREATED             { email, name, orderId, items, total, currency }
 */
export function registerEmailListeners(container) {
  const eventBus = container.resolve('eventBus');
  const emailService = container.resolve('emailService');

  eventBus.subscribe(EVENTS.OTP_REQUESTED, ({ email, ...data }) =>
    emailService.sendTemplate('otp', email, data)
  );

  eventBus.subscribe(EVENTS.PASSWORD_RESET_REQUESTED, ({ email, ...data }) =>
    emailService.sendTemplate('resetPassword', email, data)
  );

  eventBus.subscribe(EVENTS.ORDER_CREATED, ({ email, ...data }) =>
    emailService.sendTemplate('orderPlaced', email, data)
  );
}
