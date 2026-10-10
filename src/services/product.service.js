import NotFoundError from '../middlewares/errorHandler.js';
import { buildMeta } from '../utils/pagination.js';

const withTotalStock = (p) => ({
  ...p,
  totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
});

export class ProductService {

    #ProductRepository;
    #eventBus;
    #env;

    constructor({ProductRepository,eventBus,env}) {
        this.#ProductRepository = ProductRepository;
        this.#eventBus = eventBus;
        this.#env = env;
    }

    async getAllProducts() {
        return await this.#ProductRepository.findProducts();
    }

    async list(query, user) {
    const criteria = { ...query };

    // business rule: only admins can see (or filter by) inactive products
    if (user?.role !== 'admin') criteria.isActive = true;

    const { items, total } = await this.#ProductRepository.findAll(criteria);

    return {
      data: items.map(withTotalStock),
      meta: buildMeta({ total, page: query.page, limit: query.limit }),
    };
  }

  async getById(id, user) {
    const product = await this.#ProductRepository.findById(id, '-__v');
    const canSee = product && (product.isActive || user?.role === 'admin');
    if (!canSee) throw new NotFoundError('Product not found');
    return withTotalStock(product);
  }

}