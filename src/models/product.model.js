import mongoose from 'mongoose';


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