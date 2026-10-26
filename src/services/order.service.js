import { EVENTS } from '../events/eventTypes.js';
import AppError  from '../errors/AppError.js';
const CURRENCY = 'USD';
const SHIPPING_FEE = 0; // plug in your own rule later (flat fee, free over X, ...)

const round2 = (n) => Math.round(n * 100) / 100;

function mergeLines(items) {

  const merged = new Map();
  for (const { productId, size, quantity } of items) {
    const key = `${productId}:${size}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += quantity;
    else merged.set(key, { productId, size, quantity });
  }
  return [...merged.values()].sort((a, b) => a.productId.localeCompare(b.productId));

               
}

export class OrderService {
   
    #orderRepository;
    #productRepository;
    #userRepository;
    #eventBus;
    #transactionManager;
    #env;

    constructor({ orderRepository, ProductRepository, UserRepository, eventBus, TransactionManager,env }) {
        this.#orderRepository = orderRepository;
        this.#productRepository = ProductRepository;
        this.#userRepository = UserRepository;
        this.#eventBus = eventBus;
        this.#transactionManager = TransactionManager;
        this.#env = env;
    }

 async placeOrder(userId, { items, shippingAddress, paymentMethod }) {
   
    const lines = mergeLines(items);
    console.log("ur", this.#userRepository);
    const user = await this.#userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    console.log("transaction",this.#transactionManager);
    const order = await this.#transactionManager.run(async (session) => {
      const productIds = [...new Set(lines.map((l) => l.productId))];
      const products = await this.#productRepository.findByIds(productIds, { session });
      const byId = new Map(products.map((p) => [String(p._id), p]));

      const orderItems = [];
      for (const line of lines) {
        const product = byId.get(line.productId);
        if (!product) throw new AppError(`Product not found: ${line.productId}`, 404);

        const hasSize = product.variants.some((v) => v.size === line.size);
        if (!hasSize) {
          throw new AppError(`Size ${line.size} is not available for "${product.name}"`, 400);
        }

        // Atomic check-and-decrement. False = someone else got the stock first.
        const reserved = await this.#productRepository.decrementStock(
          product._id, line.size, line.quantity, { session }
        );
        if (!reserved) {
          throw new AppError(`Insufficient stock for "${product.name}" (size ${line.size})`, 409);
        }

        // Snapshot: what the customer is paying NOW, whatever the price becomes later.
        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          size: line.size,
          quantity: line.quantity,
        });
      }

      const itemsTotal = round2(orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0));
      return this.#orderRepository.createOrder(
        {
          user: userId,
          items: orderItems,
          shippingAddress,
          itemsTotal,
          shippingFee: SHIPPING_FEE,
          totalAmount: round2(itemsTotal + SHIPPING_FEE),
          paymentMethod,
        },
        { session }
      );
    });

    // Only AFTER the commit succeeded. Publishing inside the transaction
    // could email a customer about an order that then rolls back.
    this.#eventBus.publish(EVENTS.ORDER_CREATED, {
      orderId: String(order._id),
      userId: String(userId),
      email: user.email,
      name: user.name,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: order.totalAmount,
      currency: CURRENCY,
    });

    return order;
  }




}