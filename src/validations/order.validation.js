import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product id');

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectId,
        size: z.string().trim().min(1, 'Size is required').transform((s) => s.toUpperCase()),
        quantity: z.number().int().min(1).max(10, 'Max 10 per item'),
      })
    )
    .min(1, 'Order must contain at least one item')
    .max(20, 'Too many items in one order'),

  shippingAddress: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().min(6).max(20),
    street: z.string().trim().min(3),
    city: z.string().trim().min(2),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().min(2),
  }),

  paymentMethod: z.enum(['stripe', 'cod']).default('stripe'),
});
// Note: no price field anywhere. The client says WHAT to buy, never what it costs.
