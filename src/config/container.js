import { logger } from '../logs/logger.js';
import { EventBus } from '../events/eventBus.js';
import { env } from './env.js'; // adjust if your env.js exports differently
import { createMailerClient } from '../integrations/mailer.client.js';
import { EmailService } from '../services/email.service.js';
import { emailTemplates } from '../templates/emails/index.js';
import { UserModel } from '../models/user.model.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { ProductModel } from '../models/product.model.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { ProductService } from '../services/product.service.js';
import { OrderRepository } from '../repositories/order.repository.js';
import { OrderService } from '../services/order.service.js';
import { TransactionManager } from '../utils/TransactionManager.js';
import { OrderModel } from '../models/order.model.js';
import mongoose from 'mongoose';

export class Container {
  #registrations = new Map(); // name -> { factory, singleton }
  #singletonCache = new Map(); // name -> already-built instance

  registerValue(name, value) {
    this.#registrations.set(name, {
      factory: () => value,
      singleton: true,
    });
    return this;
  }

  registerFactory(name, factory, { singleton = true } = {}) {
    if (typeof factory !== 'function') {
      throw new TypeError(`registerFactory('${name}', ...) requires a function`);
    }
    this.#registrations.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    const registration = this.#registrations.get(name);

    if (!registration) {
      throw new Error(
        `Cannot resolve "${name}" — nothing registered under that name. ` +
          `Did you forget to register it in config/container.js?`
      );
    }

    if (registration.singleton) {
      if (this.#singletonCache.has(name)) {
        return this.#singletonCache.get(name);
      }
      const instance = registration.factory(this);
      this.#singletonCache.set(name, instance);
      return instance;
    }

    return registration.factory(this);
  }

  has(name) {
    return this.#registrations.has(name);
  }
}

// Single app-wide container instance. Everything else imports THIS,
// never creates its own `new Container()`.
export const container = new Container();

export function registerDependencies() {
 
  container.registerValue('logger', logger);
  


  container.registerFactory('eventBus', (c) => new EventBus(c.resolve('logger')));

  
  container.registerValue('config', env);
  container.registerFactory('mailer', (c) => createMailerClient(c.resolve('config')));
  container.registerFactory(
    'emailService',
    (c) =>
      new EmailService({
        mailer: c.resolve('mailer'),
        logger: c.resolve('logger'),
        from: c.resolve('config').EMAIL_FROM,
        templates: emailTemplates,
      })
  );

  // --- Auth: model -> repository -> service (each built from the previous) ---
  container.registerValue('UserModel', UserModel);
  container.registerFactory('userRepository', (c) => new UserRepository(c.resolve('UserModel')));
  container.registerFactory(
    'authService',
    (c) =>
      new AuthService({
        userRepository: c.resolve('userRepository'),
        eventBus: c.resolve('eventBus'),
        env: c.resolve('config'),
      })
  );

  // Products

   container.registerValue("productsModel",ProductModel);
   container.registerFactory("productRepository",(c)=>new ProductRepository(c.resolve("productsModel")))
   container.registerFactory(
    'productService',
    (c) =>
      new ProductService({
        ProductRepository: c.resolve('productRepository'),
        eventBus: c.resolve('eventBus'),
        env: c.resolve('config'),
      })
  );
   
  container.registerValue("orderModel",OrderModel);
  container.registerFactory("orderRepository",(c)=>new OrderRepository(c.resolve("orderModel")))
  container.registerValue("dbconnection",mongoose.connection);
  container.registerFactory(
    'transactionManager',
    (c) => new TransactionManager(c.resolve('dbconnection'))
  );
 
 container.registerFactory(
    'orderService',
    (c) =>
      new OrderService({
        orderRepository: c.resolve('orderRepository'),
        ProductRepository: c.resolve('productRepository'),
        UserRepository: c.resolve('userRepository'),
        TransactionManager: c.resolve('transactionManager'),
        eventBus: c.resolve('eventBus'),
        env: c.resolve('config'),
      })
  );

}
