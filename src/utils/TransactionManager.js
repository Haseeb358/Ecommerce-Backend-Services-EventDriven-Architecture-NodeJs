/**
 * Lets a SERVICE run several repository calls as one all-or-nothing
 * unit, without the service importing mongoose.
 *
 *   await transactionManager.run(async (session) => {
 *     await productRepository.decrementStock(..., { session });
 *     await orderRepository.create(..., { session });
 *   });
 *
 * If the callback throws, every write made with that `session` is
 * rolled back. If it returns, they are all committed together.
 * Mongoose also retries the callback automatically on transient
 * write conflicts, so keep the callback free of side effects that
 * must happen only once (do NOT publish events or send emails inside
 * it — do that after run() returns, once the commit has succeeded).
 *
 * REQUIREMENT: MongoDB transactions need a replica set. Atlas is one
 * by default. A plain local `mongod` is NOT — see the notes in chat.
 */
export class TransactionManager {
  #connection;

  constructor(connection) {
    this.#connection = connection;
  }

  run(callback) {
    return this.#connection.transaction(callback);
  }
}
