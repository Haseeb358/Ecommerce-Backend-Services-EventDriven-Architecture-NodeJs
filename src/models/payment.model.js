import mongoose from 'mongoose';

/**
 * Design notes:
 * - One Payment document per Stripe PaymentIntent. `order` is a
 *   one-to-one link via a UNIQUE index — one payment attempt record
 *   per order (if you later support retries on a failed payment,
 *   relax this to one-to-many and query the latest).
 * - `providerPaymentId` (Stripe's PaymentIntent id, e.g. "pi_123") has
 *   its OWN unique index. This is what makes your Stripe webhook
 *   handler IDEMPOTENT: Stripe can and will send the same webhook
 *   event more than once. Before updating anything, look this record
 *   up by `providerPaymentId`; if its status is already 'succeeded',
 *   do nothing and return 200 — don't re-process it.
 * - `rawEvent` stores the last webhook payload Stripe sent, mainly for
 *   debugging during development. Fine to keep for a learning project;
 *   a production system would be more selective about what it logs.
 */
const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    provider: { type: String, enum: ['stripe'], default: 'stripe' },
    providerPaymentId: { type: String, required: true, unique: true }, // Stripe PaymentIntent id

    amount: { type: Number, required: true, min: 0 }, // should match order.totalAmount
    currency: { type: String, required: true, default: 'usd' },

    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },

    rawEvent: { type: mongoose.Schema.Types.Mixed }, // last webhook payload (debugging aid)
  },
  { timestamps: true }
);

export const PAYMENT_STATUS = Object.freeze(
  Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.toUpperCase(), s]))
);

export const PaymentModel = mongoose.model('Payment', paymentSchema);