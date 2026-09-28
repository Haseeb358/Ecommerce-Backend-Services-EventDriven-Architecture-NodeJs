import  AppError  from '../errors/AppError.js';

/**
 * validate(schema) -> middleware that checks req.body against a zod schema.
 * On success, req.body is replaced with the cleaned/parsed data
 * (trimmed, lowercased, unknown fields stripped).
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(', ');
    return next(new AppError(message, 400));
  }
  req.body = result.data;
  next();
};
