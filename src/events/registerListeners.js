import { registerOrderListeners } from './listeners/order.listeners.js';
import { registerEmailListeners } from './listeners/email.listeners.js';


export function registerListeners(container) {
  registerOrderListeners(container);
  registerEmailListeners(container);
}
