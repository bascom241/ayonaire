import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  getInstructorCourses,
  getInstructorStats,
  getInstructorStudents,
} from "../services/instructorDashboard.service.js";

interface AuthRequest extends Request {
  user?: { id?: string; role?: string };
}

export const stats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await getInstructorStats(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const courses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await getInstructorCourses(userId, req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const students = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await getInstructorStudents(userId, req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};
