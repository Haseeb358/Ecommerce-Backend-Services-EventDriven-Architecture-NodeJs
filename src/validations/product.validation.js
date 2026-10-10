// validations/product.validation.js
import { z } from 'zod';
import { buildListQuerySchema, booleanString } from './common.validation.js';

export const getProductsQuery = buildListQuerySchema(['price', 'name', 'createdAt'])
  .extend({
    category: z.string().trim().min(1).max(50).optional(),
    subCategory: z.string().trim().min(1).max(50).optional(),
    size: z.string().trim().toUpperCase().max(10).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    bestseller: booleanString.optional(),
    inStock: booleanString.optional(),
    isActive: booleanString.optional(), // only honoured for admins (see service)
  })
  .refine(
    (q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice,
    { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] }
  );

export const productIdParam = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product id'),
});