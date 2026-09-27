import AppError from "../errors/AppError.js";

export default (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
};