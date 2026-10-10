import { BaseRepository } from './base.repository.js';
export class ProductRepository extends BaseRepository {
 
    #Product;

    constructor(ProductModel) {
         super(ProductModel);
        this.#Product = ProductModel;
       
    }

    // First find all products as i wjust test the route and the model
   

    buildFilter({ search, category, subCategory, minPrice, maxPrice, bestseller, isActive, size, inStock }) {
    const filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (bestseller !== undefined) filter.bestseller = bestseller;
    if (isActive !== undefined) filter.isActive = isActive;

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // size and/or in-stock must match on the SAME variant, hence $elemMatch
    if (size || inStock) {
      const match = {};
      if (size) match.size = size;
      if (inStock) match.stock = { $gt: 0 };
      filter.variants = { $elemMatch: match };
    }

    // uses the { name: 'text', description: 'text' } index from your model
    if (search) filter.$text = { $search: search };

    return filter;
  }

  findAll({ page, limit, sort, ...criteria }) {
    return this.paginate({
      filter: this.buildFilter(criteria),
      sort,
      page,
      limit,
      select: '-__v',
    });
  }


}