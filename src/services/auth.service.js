import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import AppError  from '../errors/AppError.js';
import { EVENTS } from '../events/eventTypes.js';

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRES_MINUTES = 10;

/**
 * Business logic for authentication. Knows nothing about req/res (HTTP)
 * or Mongoose (DB). It only talks to the repository and the event bus,
 * both injected.
 */
export class AuthService {
  #userRepository;
  #eventBus;
  #env

  constructor({ userRepository, eventBus,env }) {
    this.#userRepository = userRepository;
    this.#eventBus = eventBus;
    this.#env = env;
  }

  async register({ name, email, password }) {
    // 1. Business rule: email must be unique
    const existing = await this.#userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Prepare secrets
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // 3. Persist (repository does the DB work)
    const user = await this.#userRepository.create({
      name,
      email,
      password: passwordHash,
      otpHash,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000),
    });

    // 4. Announce what happened. The service does NOT send the email itself;
    //    whoever listens decides what to do. Fire-and-forget.
    this.#eventBus.publish(EVENTS.USER_REGISTERED, { userId: user.id, email: user.email });
    this.#eventBus.publish(EVENTS.OTP_REQUESTED, {
      email: user.email,
      name: user.name,
      otp, // plaintext only travels in memory, to the email listener
      expiresInMinutes: OTP_EXPIRES_MINUTES,
    });

    return user; // toJSON strips secrets
  }

  async verifyOtp({ email, otp }) {
    const user = await this.#userRepository.findByEmail(email).select('+otpHash +otpExpiresAt');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    console.log('otp:', otp);
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (user.otpHash !== otpHash) {
      throw new AppError('Invalid OTP', 400);
    }

    if (user.otpExpiresAt < new Date()) {
      throw new AppError('OTP has expired', 400);
    }

    // Mark the user as verified
    let updatedUser = await this.#userRepository.updateById(user.id, { isEmailVerified: true, otpHash: null, otpExpiresAt: null });

    // Announce the verification
    this.#eventBus.publish(EVENTS.OTP_VERIFIED, { userId: user.id });

    return updatedUser; // toJSON strips secrets
  }

  async login({ email, password }) {

    console.log(email, password);

    const user = await this.#userRepository.findByEmail(email).select('+password');
    if (!user) {
      throw new AppError('Invalid email', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Email not verified', 403);
    }

    const token = this.generateJwtToken({ id: user._id,role: user.role });

    return { token, user }; // toJSON strips secrets

  }

  generateJwtToken(data) {
    return jwt.sign({ ...data }, this.#env.JWT_SECRET, { expiresIn: this.#env.JWT_EXPIRES_IN });
  }

}
