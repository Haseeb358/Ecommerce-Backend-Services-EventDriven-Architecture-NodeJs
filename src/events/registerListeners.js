import { registerOrderListeners } from './listeners/order.listeners.js';
import { registerEmailListeners } from './listeners/email.listeners.js';

/**
 * Explicit style: each listener file exports a function, and we call it
 * here with the container. Nothing runs at import time, so there is no
 * timing problem — server.js simply calls this AFTER registerDependencies().
 */
export function registerListeners(container) {
  registerOrderListeners(container);
  registerEmailListeners(container);
}
