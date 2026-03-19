import { Request, Response, NextFunction } from "express";
import { instructorRequest } from "../types/instructor.types.js";
import { AppError } from "../errors/AppError.js";
import {
  applyAsInstructor,
  approveInstructorApplicationStatus,
  rejectInstructorApplicationStatus,
  getInstructorProfile,
  getInstructorProfiles,
} from "../services/intstructorManagement.service.js";

interface AuthRequest extends Request {
  body: instructorRequest;
  user?: { id: string };
}

export const apply = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("User not authenticated", 401);

    const { bio, expertise, instructorCourseCategory } = req.body;

    if (!bio || !expertise || !instructorCourseCategory) {
      throw new AppError("Invalid instructor data", 400);
    }

    const instructor = await applyAsInstructor(userId, req.body);
    res
      .status(201)
      .json({ message: "Instructor application submitted", data: instructor });
  } catch (error) {
    next(error);
  }
};

export const approve = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {userId} = req.body;
    const message = await approveInstructorApplicationStatus(userId);
    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const reject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {userId} = req.body;
    const message = await rejectInstructorApplicationStatus(userId);
    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const getProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getInstructorProfiles();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {userId} = req.body;
    const data = await getInstructorProfile(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
