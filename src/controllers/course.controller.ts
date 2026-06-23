import { NextFunction, Request, Response } from "express";
import { Express } from "express";
import {
  createCourseCategory,
  createCourse,
  updateCourse,
  assignInstuctorToCourse,
  saveCourseAsDraft,
  getAllCoursesForAdminDashboard,
  getASingleCourseForAdminDashboard
} from "../services/course.service.js";
import { CreateCourseRequest } from "../types/course.types.js";
import { AppError } from "../errors/AppError.js";
import redisClient from "../config/redis.js";

export const createCourseCat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title } = req.body;
    const data = await createCourseCategory(title);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const dataToSend: CreateCourseRequest = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: req.body.instructorId,
      thumbnail: req.file,
      courseLevel: req.body.courseLevel,
    };

    const data = await createCourse(dataToSend);
    await redisClient.del("cache:/course")

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.query;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }

    const dataToSend: Partial<CreateCourseRequest> = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: req.body.instructorId,
      thumbnail: req.file,
      courseLevel: req.body.courseLevel,
    };

    const data = await updateCourse(courseId, dataToSend);

    res.status(200).json({
      success: true,
      message: "Course edit successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Admin assing the course o an instructor
export const assign = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, instructorId } = req.query;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }
    if (!instructorId || typeof instructorId !== "string") {
      throw new AppError("instructorId is required", 400);
    }

    const data = await assignInstuctorToCourse(instructorId, courseId);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};

export const saveToDraft = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const thumbnail = files?.thumbnail?.[0];
    const introVideo = files?.introVideo?.[0];

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }
    const dataToSend: CreateCourseRequest = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: req.body.instructorId,
      thumbnail,
      introVideo,
      courseLevel: req.body.courseLevel,
    };

    const data = await saveCourseAsDraft(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


export const getAdminCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;

    const data = await getAllCoursesForAdminDashboard(query);
    res.status(200).json({success: true , ...data})
  } catch (error) {
    next(error)
  }
}


export const getSingleAdminCourse = async ( req: Request, res: Response, next: NextFunction) => {
  try {
     const { courseId } = req.params;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }

    const data = await getASingleCourseForAdminDashboard(courseId);

    res.status(200).json({success: true, data})
  } catch (error) {
    next(error)
  }
}
