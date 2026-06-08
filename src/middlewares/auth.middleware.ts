import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { TokenPayload, UserStatus } from "../types/user.types.js";
import User from "../models/user.model.js";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
export const authorize = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: token missing", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

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
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Unauthorized: invalid token", 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
};
