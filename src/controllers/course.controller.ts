import { NextFunction, Request, Response } from "express";
import { Express } from "express";
import {
  createCourseCategory,
  listCourseCategories,
  createCourse,
  updateCourse,
  assignInstuctorToCourse,
  saveCourseAsDraft,
  getAllCoursesForAdminDashboard,
  getASingleCourseForAdminDashboard,
  getAllCourses,
  getCourseById,
  deleteCourse,
  toggleCoursePublishStatus,
} from "../services/course.service.js";
import { CreateCourseRequest } from "../types/course.types.js";
import { AppError } from "../errors/AppError.js";
import { safeCacheDel } from "../config/redis.js";

interface AuthRequest extends Request {
  user?: { id: string; role?: string };
}

const getCourseUploadFiles = (req: Request) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  return {
    thumbnail: files?.thumbnail?.[0],
    introVideo: files?.introVideo?.[0],
  };
};

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

export const getCourseCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await listCourseCategories();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const resolveInstructorId = (req: AuthRequest) =>
  req.user?.role === "instructor" ? req.user.id : req.body.instructorId;

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { thumbnail, introVideo } = getCourseUploadFiles(req);

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const dataToSend: CreateCourseRequest = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: resolveInstructorId(req),
      thumbnail,
      introVideo,
      introVideoUrl: req.body.introVideoUrl,
      introVideoTitle: req.body.introVideoTitle,
      introVideoProvider: req.body.introVideoProvider,
      introVideoDuration:
        req.body.introVideoDuration !== undefined
          ? Number(req.body.introVideoDuration)
          : undefined,
      courseLevel: req.body.courseLevel,
    };

    const data = await createCourse(dataToSend);
    await safeCacheDel("cache:/course");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const edit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.query;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }
    const { thumbnail, introVideo } = getCourseUploadFiles(req);

    const dataToSend: Partial<CreateCourseRequest> = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: resolveInstructorId(req),
      thumbnail,
      introVideo,
      introVideoUrl: req.body.introVideoUrl,
      introVideoTitle: req.body.introVideoTitle,
      introVideoProvider: req.body.introVideoProvider,
      introVideoDuration:
        req.body.introVideoDuration !== undefined
          ? Number(req.body.introVideoDuration)
          : undefined,
      courseLevel: req.body.courseLevel,
      completionCertificate:
        req.body.completionCertificate !== undefined
          ? req.body.completionCertificate === "true" ||
            req.body.completionCertificate === true
          : undefined,
    };

    const data = await updateCourse(courseId, dataToSend, req.user?.id, req.user?.role);

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
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { thumbnail, introVideo } = getCourseUploadFiles(req);

    if (!thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }
    const dataToSend: CreateCourseRequest = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      status: req.body.status,
      instructor: resolveInstructorId(req),
      thumbnail,
      introVideo,
      introVideoUrl: req.body.introVideoUrl,
      introVideoTitle: req.body.introVideoTitle,
      introVideoProvider: req.body.introVideoProvider,
      introVideoDuration:
        req.body.introVideoDuration !== undefined
          ? Number(req.body.introVideoDuration)
          : undefined,
      courseLevel: req.body.courseLevel,
    };

    const data = await saveCourseAsDraft(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query;

    const data = await getAllCoursesForAdminDashboard(query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getSingleAdminCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = req.params.courseId as string;
    if (!courseId || typeof courseId !== "string") {
      throw new AppError("courseId is required", 400);
    }

    const data = await getASingleCourseForAdminDashboard(courseId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllCourses(req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getSingle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = req.params.courseId as string;
    const data = await getCourseById(courseId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const courseId = req.params.courseId as string;
    await deleteCourse(courseId, userId, req.user?.role);
    await safeCacheDel("cache:/course");
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    next(error);
  }
};

export const togglePublish = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const courseId = req.params.courseId as string;
    const data = await toggleCoursePublishStatus(
      courseId,
      userId,
      req.user?.role,
    );
    await safeCacheDel("cache:/course");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
