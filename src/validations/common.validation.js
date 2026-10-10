import {z} from 'zod';
// validations/common.validation.js
export const booleanString = z.enum(['true', 'false']).transform((v) => v === 'true');

// "-price,name"  ->  { price: -1, name: 1 }
const parseSort = (str) =>
  str.split(',').reduce((acc, s) => {
    const desc = s.startsWith('-');
    acc[desc ? s.slice(1) : s] = desc ? -1 : 1;
    return acc;
  }, {});

export const buildListQuerySchema = (sortFields, defaultSort = '-createdAt') =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    sort: z
      .string()
      .optional()
      .refine(
        (v) => !v || v.split(',').every((s) => sortFields.includes(s.replace(/^-/, ''))),
        { message: `sort must be one of: ${sortFields.join(', ')} (prefix with - for descending)` }
      )
      .transform((v) => parseSort(v || defaultSort)),
  });