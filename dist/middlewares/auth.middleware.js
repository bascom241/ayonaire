import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { UserStatus } from "../types/user.types.js";
import User from "../models/user.model.js";
export const authorize = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Unauthorized: token missing", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError("Unauthorized: user not found", 401);
        }
        if (user.status === UserStatus.SUSPENDED) {
            throw new AppError("Forbidden: account suspended", 403);
        }
        if (user.status === UserStatus.INACTIVE) {
            throw new AppError("Forbidden: account inactive", 403);
        }
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError("Unauthorized: invalid token", 401));
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError("Forbidden", 403);
        }
        next();
    };
};
