/**
 * errorHandler.js
 *
 * The single, centralized place that decides what every client sees
 * when something goes wrong. MUST be registered LAST in app.js,
 * after notFound.js and all routes.
 *
 * Flow:
 *   raw error (Mongoose/Prisma/JWT/bug) -> converted to AppError
 *   -> isOperational check -> real message (safe) or generic message (hidden)
 *
 * This file includes converters for BOTH Mongoose and Prisma.
 * MONGOOSE IS ACTIVE BY DEFAULT.
 * If your project uses Prisma instead, comment out the "MONGOOSE" block
 * inside the exported handler below and uncomment the "PRISMA" block.
 * If your project uses neither (e.g. plain SQL / another ORM), remove
 * whichever you don't need and add your own converter the same way.
 */

import { logger } from '../logs/logger.js';
import AppError from '../errors/AppError.js';

// ───────────────────────── MONGOOSE CONVERTERS ─────────────────────────

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`${field} already exists`, 400);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input: ${messages.join('. ')}`, 400);
};

// ────────────────────────── PRISMA CONVERTERS ──────────────────────────

const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`${field} already exists`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  if (err.code === 'P2003') {
    return new AppError('Invalid reference — related record does not exist', 400);
  }
  return new AppError('Database error', 500);
};

// ─────────────────────────── JWT CONVERTERS ────────────────────────────
// Keep these regardless of DB/ORM choice — only relevant if you use JWT auth.

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401);

// ───────────────────────────── RESPONDERS ──────────────────────────────

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Unknown / programmer error — never leak details to the client
  logger.error('UNEXPECTED ERROR 💥', { message: err.message, stack: err.stack });
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

// ────────────────────────── THE MIDDLEWARE ─────────────────────────────

let errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return sendDevError(err, res);
  }

  let error = Object.create(err);
  error.message = err.message;

  // ── MONGOOSE (active by default) ──
  if (error.name === 'CastError') error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateKey(error);
  if (error.name === 'ValidationError') error = handleValidationError(error);

  // ── PRISMA (uncomment if this project uses Prisma instead of Mongoose) ──
  // if (error.constructor?.name === 'PrismaClientKnownRequestError') {
  //   error = handlePrismaError(error);
  // }

  // ── JWT (keep if you use JWT auth, regardless of DB choice) ──
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  sendProdError(error, res);
};

export default errorHandler;