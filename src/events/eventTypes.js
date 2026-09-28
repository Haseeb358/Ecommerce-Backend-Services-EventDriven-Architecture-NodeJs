/**
 * Central list of every event the app can publish.
 * Naming convention: '<domain>.<pastTenseThingThatHappened>'
 */
export const EVENTS = {
  USER_REGISTERED: 'user.registered',
  OTP_REQUESTED: 'auth.otpRequested',
  PASSWORD_RESET_REQUESTED: 'auth.passwordResetRequested',

  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',

  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',

  STOCK_LOW: 'stock.low',
};
