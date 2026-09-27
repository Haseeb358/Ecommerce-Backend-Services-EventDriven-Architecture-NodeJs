import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../logs/logger.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    // No DB, no app — don't let the server start in a half-broken state
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
}
