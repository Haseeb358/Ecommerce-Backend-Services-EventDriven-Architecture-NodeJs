/**
 * A minimal Dependency Injection container.
 *
 * The idea: instead of a service file doing
 *   import { userRepository } from '../repositories/user.repository.js'
 * (a hard-coded dependency), it receives its dependencies as constructor
 * arguments. This container is the ONE place responsible for deciding
 * *which* concrete implementation to hand over, and in what order to
 * build everything.
 *
 * Two registration styles:
 *   - registerValue(name, value)   -> for things that already exist
 *                                      (a config object, a logger, a mongoose model)
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
 *
 *   container.registerFactory(
 *     'authService',
 *     (c) => new AuthService(c.resolve('userRepository'), c.resolve('eventBus')),
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

    // Non-singleton: build a fresh instance every time it's resolved
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
 * Registers every dependency the app needs. Called once at boot,
 * from server.js, AFTER the DB connection is established (since some
 * registrations will need mongoose models to already be compiled).
 *
 * Build this up incrementally as you add each vertical slice — don't
 * try to fill it in all at once before you've built the pieces.
 *
 * Example of how this file will grow:
 *
 *   import { UserModel } from '../models/user.model.js';
 *   import { UserRepository } from '../repositories/user.repository.js';
 *   import { AuthService } from '../services/auth.service.js';
 *   import { eventBus } from '../events/eventBus.js';
 *
 *   export function registerDependencies() {
 *     container.registerValue('UserModel', UserModel);
 *     container.registerValue('eventBus', eventBus);
 *
 *     container.registerFactory(
 *       'userRepository',
 *       (c) => new UserRepository(c.resolve('UserModel'))
 *     );
 *
 *     container.registerFactory(
 *       'authService',
 *       (c) => new AuthService(c.resolve('userRepository'), c.resolve('eventBus'))
 *     );
 *   }
 *
 * Then in a controller file:
 *
 *   import { container } from '../config/container.js';
 *   const authService = container.resolve('authService');
 *
 *   export const register = catchAsync(async (req, res) => {
 *     const user = await authService.register(req.body);
 *     res.status(201).json({ success: true, data: user });
 *   });
 */
export function registerDependencies() {
  // Intentionally empty for now — fill in as each layer gets built.
  // Keeping this function (rather than registering inline wherever)
  // means server.js has one clear call: registerDependencies().
}
