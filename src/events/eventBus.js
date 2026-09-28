import { EventEmitter } from 'node:events';

/**
 * Same EventBus as before, but now it takes its logger as a constructor
 * argument instead of importing the logger module directly.
 *
 * Why this matters: before, eventBus.js hard-coded
 *   import { logger } from '../utils/logger.js'
 * which means EventBus could ONLY ever use that exact logger. Injecting
 * it means the container decides what EventBus gets — your real winston
 * logger in production, a no-op logger in tests, etc. This is the same
 * principle as injecting a repository into a service: EventBus doesn't
 * need to know HOW logging works, just that it was handed something
 * with .info/.error/.debug methods.
 *
 * This file no longer creates or exports a singleton instance — the
 * container does that now (see config/container.js), via:
 *
 *   container.registerFactory('eventBus', (c) => new EventBus(c.resolve('logger')));
 */
export class EventBus extends EventEmitter {
  #logger;

  constructor(logger) {
    super();
    this.#logger = logger;
  }

  /**
   * Register a listener for an event. Wraps it so:
   *  - a thrown/rejected error is caught and logged, never crashes the app
   *  - it doesn't matter whether the handler is sync or async
   */
  subscribe(eventName, handler) {
    const safeHandler = async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        this.#logger.error(
          `Listener for "${eventName}" failed: ${err.message}\n${err.stack}`
        );
      }
    };
    this.on(eventName, safeHandler);
    return this;
  }

  /**
   * Publish an event. Fire-and-forget — the caller does NOT await
   * listener completion (see the class-level note in the original
   * version of this file for the tradeoff this implies).
   */
  publish(eventName, payload) {
    this.#logger.info(`Event published: ${eventName}`);
    this.emit(eventName, payload);
  }
}