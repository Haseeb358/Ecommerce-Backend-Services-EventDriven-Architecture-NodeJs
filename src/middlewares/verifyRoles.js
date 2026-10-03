import AppError from "../errors/AppError.js";

export function verifyRoles(...allowedRoles) {
  return (req, res, next) => {
    try{

        if (!req.LoginUser || !allowedRoles.includes(req.LoginUser.role)) {
            throw new AppError("Forbidden: You do not have permission to access this resource", 403);
        }

        next();

    }catch(error){
        next(error);
    }
  };
}