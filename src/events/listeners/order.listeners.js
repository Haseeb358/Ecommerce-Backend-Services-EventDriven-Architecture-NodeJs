import { EVENTS } from '../eventTypes.js';

export function registerOrderListeners(container) {
  const eventBus = container.resolve('eventBus');
  const logger = container.resolve('logger');

  eventBus.subscribe(EVENTS.ORDER_CREATED, async ({ orderId }) => {
    logger.info(`[order.listeners] ORDER_CREATED received for order ${orderId}`);
    // Stock decrement: do it inside the order's DB transaction, not here.
  });
}
