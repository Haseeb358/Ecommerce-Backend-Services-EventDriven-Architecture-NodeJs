import mongoose from 'mongoose';

/**
 * Matches the shape of your 50-product JSON dataset, plus the fields
 * an e-commerce backend actually needs on top (stock safety, indexing).
 *
 * Design notes:
 * - `legacyId` keeps the original numeric `id` from your JSON so you can
 *   re-import/debug against the source file. The real identifier the
 *   rest of the app uses is Mongo's own `_id`.
 * - `date` from your JSON (a epoch-millis long) is dropped in favor of
 *   Mongoose's built-in `timestamps` (`createdAt`/`updatedAt`) — no
 *   reason to maintain your own date field when Mongoose gives you one.
 * - `sizes` becomes `variants`: each size needs its OWN stock count in
 *   a real store (you can be out of M but have L). Your flat JSON
 *   doesn't have per-size stock, so on import, split the single `stock`
 *   evenly or put it all on the first size — a known simplification,
 *   fine for a learning project.
 * - `optimisticConcurrency: true` enables Mongoose's built-in version
 *   check (uses __v). When two requests try to decrement stock on the
 *   SAME product version at the SAME time, the second save fails with
 *   a VersionError instead of silently overwriting the first one's
 *   change. This is your race-condition safety net for checkout —
 *   catch VersionError in orderService and retry or reject the request.
 */
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true, uppercase: true }, // 'M', 'L', 'XL'
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true }, // original `id` from the JSON dataset, for reference only

    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },

    price: { type: Number, required: true, min: 0 },

    images: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Product must have at least one image',
      },
    },

    category: { type: String, required: true, trim: true }, // 'Men' | 'Women' | 'Kids'
    subCategory: { type: String, required: true, trim: true }, // 'Topwear' | 'Bottomwear' | ...

    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Product must have at least one size/variant',
      },
    },

    bestseller: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true }, // soft "unpublish" instead of deleting
  },
  { timestamps: true, optimisticConcurrency: true }
);

// Supports GET /products?category=Men&subCategory=Topwear
productSchema.index({ category: 1, subCategory: 1 });
// Supports a simple text search box: name + description
productSchema.index({ name: 'text', description: 'text' });

/** Total stock across all sizes — handy for "X in stock" display or sort. */
productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});
productSchema.set('toJSON', { virtuals: true });

export const ProductModel = mongoose.model('Product', productSchema);