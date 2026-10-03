import { logger } from '../logs/logger.js';
import { EventBus } from '../events/eventBus.js';
import { env } from './env.js'; // adjust if your env.js exports differently
import { createMailerClient } from '../integrations/mailer.client.js';
import { EmailService } from '../services/email.service.js';
import { emailTemplates } from '../templates/emails/index.js';
import { UserModel } from '../models/user.model.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';

/**
 * A minimal Dependency Injection container.
 *
 * Two registration styles:
 *   - registerValue(name, value)   -> for things that already exist
 *                                      (a config object, a mongoose model)
 *   - registerFactory(name, fn, {singleton}) -> for things that need to be
 *                                      *constructed*, and may themselves
 *                                      depend on other registered things
 *
 * A factory function receives the container itself, so it can pull its
 * own dependencies out by name:
 *
 *   container.registerFactory(
 *     'userRepository',
 *     (c) => new UserRepository(c.resolve('UserModel')),
 *     { singleton: true }
 *   );
 */
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

/**
 * Registers every dependency the app needs. Called once at boot, from
 * server.js, AFTER the DB connection is established.
 *
 * Order matters within this function: register things with NO
 * dependencies first (logger), then things that depend on them
 * (eventBus depends on logger), and so on down the chain. The
 * container doesn't auto-sort this for you — YOU decide the order,
 * which is exactly the kind of thing worth being able to explain.
 */
export function registerDependencies() {
  // --- Infrastructure (no dependencies of their own) ---
  container.registerValue('logger', logger);
  // Swap the line above for your winston logger — this container code
  // doesn't change, only what `logger.js` exports changes.

  // --- Things that depend on infrastructure ---
  container.registerFactory('eventBus', (c) => new EventBus(c.resolve('logger')));

  // --- Email (Brevo via SMTP) ---
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

  // Fill in the rest as each layer gets built, e.g.:
  //
  //   import { UserModel } from '../models/user.model.js';
  //   import { UserRepository } from '../repositories/user.repository.js';
  //   import { AuthService } from '../services/auth.service.js';
  //
  //   container.registerValue('UserModel', UserModel);
  //
  //   container.registerFactory(
  //     'userRepository',
  //     (c) => new UserRepository(c.resolve('UserModel'))
  //   );
  //
  //   container.registerFactory(
  //     'authService',
  //     (c) => new AuthService(c.resolve('userRepository'), c.resolve('eventBus'))
  //   );
}
