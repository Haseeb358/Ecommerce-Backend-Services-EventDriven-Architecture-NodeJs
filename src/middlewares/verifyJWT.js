import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";
export const authenticateUser = (req, res, next) => {

    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new AppError("Unauthorized: Please log in to access this resource", 401);
        }
        jwt.verify(token, process.env.JWTSECERET, (err, decodedToken) => {
            if (err) {
                throw new AppError("Unauthorized: Invalid token", 401);
            }
            req.LoginUser = decodedToken; 
            next();
        });
    } catch (error) {
        next(error);
    }

}
