import { NextFunction, Request, Response } from "express";
import {
  viewCompletedCourses,
  viewEnrolledCourses,
  getEnrolledCourseDetail,
} from "../services/enroll.service.js";
import { AppError } from "../errors/AppError.js";

interface AuthRequest extends Request {
  user?: { id?: string };
}

export const enrolledCourses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("unauthorized", 401);
    }

    const data = await viewEnrolledCourses(id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const completedCourses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("unauthorized", 401);
    }

    const data = await viewCompletedCourses(id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const courseDetail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.user?.id;
    if (!id) {
      throw new AppError("unauthorized", 401);
    }

    const { courseId } = req.params;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }

    const data = await getEnrolledCourseDetail(id, courseId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
