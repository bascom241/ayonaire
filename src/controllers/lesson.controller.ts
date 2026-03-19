import {
  getResumeLesson,
  markLessonAsCompleted,
  updateLastLesson,
  uploadLesson,
  viewLessonContent,

} from "../services/lesson.service.js";
import { NextFunction, Request, Response } from "express";
import {
  MarkLessonCompleted,
  UploadLessonRequest,
  UpdateLastLesson,
  ResumeLessonRequest,
  ViewLessonRequest
} from "../types/lesson.types.js";
import { AppError } from "../errors/AppError.js";
import { uploadVideo } from "../services/lesson.service.js";

interface LessonParams {
  lessonId: string;
}

export const upload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, module, course, order } = req.body;
    if (!course || !title || !module || !order) {
      throw new AppError("Title,module, course and order is required", 400);
    }
    const dataToSend: UploadLessonRequest = {
      title,
      module,
      course,
      order,
    };
    const data = await uploadLesson(dataToSend);
    res.status(200).json({ success: true, data, message: "Lesson created" });
  } catch (error) {
    next(error);
  }
};

export const uploadVid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "No videos uploaded" });
    }

    const { lessonId } = req.body;

    const titles = req.body.titles; // array of strings
    const videos = req.files.map((file, index) => ({
      title: titles?.[index] || file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
    }));

    const data = await uploadVideo(lessonId, { videos });
    res.status(200).json({
      success: true,
      data,
      message: "Lesson Video created succefully",
    });
  } catch (error) {
    next(error);
  }
};

export const markLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, courseId, lessonId } = req.body;

    const dataToSend: MarkLessonCompleted = {
      studentId,
      courseId,
      lessonId,
    };

    const data = await markLessonAsCompleted(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, lessonId, studentId } = req.body;

    const dataToSend: UpdateLastLesson = {
      courseId,
      lessonId,
      studentId,
    };

    const data = await updateLastLesson(dataToSend);
    res
      .status(200)
      .json({ success: true, data, message: "Last lesson updated" });
  } catch (error) {
    next(error);
  }
};

export const resume = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, studentId } = req.body;

    const dataToSend: ResumeLessonRequest = {
      courseId,
      studentId,
    };

    const data = await getResumeLesson(dataToSend);
    res
      .status(200)
      .json({ success: true, message: "Last lesson resumed", data });
  } catch (error) {
    next(error);
  }
};

export const view = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, studentId } = req.body;

    const dataToSend: ViewLessonRequest = {
      courseId,
      studentId,
    };

    const data = await viewLessonContent(dataToSend);
    res.status(200).json({success:true, data})
  } catch (error) {
    next(error)
  }
};
