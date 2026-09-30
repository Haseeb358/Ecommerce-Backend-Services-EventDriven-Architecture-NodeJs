/**
 * The ONLY place that knows Mongoose exists for users.
 * The model is injected, so the service never imports mongoose.
 */
export class UserRepository {
  #User;

  constructor(UserModel) {
    this.#User = UserModel;
  }

  findByEmail(email) {
    return this.#User.findOne({ email: email.toLowerCase() });
  }

  findById(id) {
    return this.#User.findById(id);
  }

  create(data) {
    return this.#User.create(data);
  }
  updateById(id, data) {
    return this.#User.findByIdAndUpdate(id, data, { new: true });
  }
}
