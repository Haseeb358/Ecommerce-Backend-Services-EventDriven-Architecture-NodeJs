import {BaseRepository} from './base.repository.js';

export class OrderRepository extends BaseRepository {

    #Order;
    constructor(OrderModel) {
        super(OrderModel);
        this.#Order = OrderModel;
    }

    async createOrder(orderData,{ session } = {}) {
        const [order] = await this.#Order.create([orderData], { session });
        return await order.save();
    }

    // build filter for geting all orders

    buildFilter({ user, status, paymentStatus, paymentMethod, startDate, endDate }) {
        const filter = {};
        if (user) filter.user = user;
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if(paymentMethod) filter.paymentMethod = paymentMethod;
        if (startDate) filter.createdAt = { ...filter.createdAt, $gte: startDate };
        if (endDate) filter.createdAt = { ...filter.createdAt, $lte: endDate };

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