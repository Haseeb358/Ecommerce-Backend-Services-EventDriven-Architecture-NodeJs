import mongoose from 'mongoose';


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