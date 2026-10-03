import mongoose from 'mongoose';

/**
 * Design notes:
 * - `items` is a SNAPSHOT of what was bought: name, price, size, quantity
 *   are copied in at order time, not referenced live from Product. If
 *   you change a product's price tomorrow, past orders must still show
 *   what the customer actually paid — never compute an old order's
 *   total from the current product price.
 * - `product` still keeps a ref, for convenience (e.g. "buy again",
 *   admin links back to the product) — but it's a reference for
 *   NAVIGATION only, never for recalculating totals.
 * - `status` is the order lifecycle. `paymentStatus` is deliberately
 *   separate (not folded into `status`) because payment and
 *   fulfillment are two different concerns that change independently
 *   — you can be `processing` fulfillment while `paid`, or `pending`
 *   payment while the order already exists in `created` status.
 * - Money fields are stored in the smallest currency unit (integer
 *   cents) is the "correct" production approach, avoiding float
 *   rounding errors — but for a learning project, plain Number with
 *   2 decimal places is fine and easier to read; just be consistent.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot
    price: { type: Number, required: true, min: 0 }, // snapshot — price AT PURCHASE time
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ORDER_STATUSES = ['created', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    shippingAddress: { type: addressSchema, required: true },

    itemsTotal: { type: Number, required: true, min: 0 }, // sum of item price*qty
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 }, // itemsTotal + shippingFee

    status: { type: String, enum: ORDER_STATUSES, default: 'created' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },

    paymentMethod: { type: String, enum: ['stripe', 'cod'], default: 'stripe' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 }); // "my orders", newest first

export const ORDER_STATUS = Object.freeze(
  Object.fromEntries(ORDER_STATUSES.map((s) => [s.toUpperCase(), s]))
);
export const PAYMENT_STATUS = Object.freeze(
  Object.fromEntries(PAYMENT_STATUSES.map((s) => [s.toUpperCase(), s]))
);

export const OrderModel = mongoose.model('Order', orderSchema);