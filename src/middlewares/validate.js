import  AppError  from '../errors/AppError.js';




// source: 'query' | 'params' | 'body'
export const validate = (schema, source = 'query') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return next(new AppError(`Validation failed: ${JSON.stringify(details)}`, 400));
  }
  req.validated = { ...req.validated, [source]: result.data };
  next();
};
