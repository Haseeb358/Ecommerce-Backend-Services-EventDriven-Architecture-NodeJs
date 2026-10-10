// repositories/base.repository.js
export class BaseRepository {
 #model;
  constructor(model) {
    this.#model = model;
  }

  findById(id, select = '') {
    return this.#model.findById(id).select(select).lean();
  }

  async paginate({ filter = {}, sort = { createdAt: -1 }, page, limit, select = '' }) {
    // _id tiebreaker keeps page order stable when many docs share the same sort value
    const finalSort = sort._id ? sort : { ...sort, _id: -1 };

    const [items, total] = await Promise.all([
      this.#model
        .find(filter)
        .select(select)
        .sort(finalSort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.#model.countDocuments(filter),
    ]);
    return { items, total };
  }
}