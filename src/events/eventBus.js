import { EventEmitter } from 'node:events';


export class EventBus extends EventEmitter {
  #logger;

  constructor(logger) {
    super();
    this.#logger = logger;
  }

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

 
  publish(eventName, payload) {
    this.#logger.info(`Event published: ${eventName}`);
    this.emit(eventName, payload);
  }
}