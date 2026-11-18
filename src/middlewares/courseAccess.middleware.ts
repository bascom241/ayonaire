import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import lessonModel from "../models/lesson.model.js";
import { CourseQuestion } from "../models/courseInteraction.model.js";

export async function canAccessCourse(courseId: string, userId: string, role: string): Promise<boolean> {
  const course = await courseModel.findById(courseId);
  if (!course) return false;
  if (role === "admin") return true;
  if (role === "instructor" && course.instructor?.toString() === userId) return true;
  return !!(await enrollmentModel.exists({ student: userId, course: courseId, status: { $ne: "cancelled" } }));
}

export async function courseAccess(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) throw new AppError("Unauthorized", 401);
    let courseId = req.params.courseId as string | undefined;
    if (!courseId && req.params.questionId) {
      const question = await CourseQuestion.findById(req.params.questionId);
      if (!question) throw new AppError("Question not found", 404);
      courseId = question.course.toString();
    }
    if (!courseId || !(await canAccessCourse(courseId, user.id, user.role))) throw new AppError("Course access denied", 403);
    const lessonId = (req.params.lessonId || req.query.lessonId || req.body?.lessonId) as string | undefined;
    if (lessonId) {
      const lesson = await lessonModel.findOne({ _id: lessonId, course: courseId });
      if (!lesson) throw new AppError("Lesson not found in this course", 404);
      if (user.role !== "admin" && user.role !== "instructor" && (!lesson.isPublished || (lesson.isLocked && !lesson.isFreePreview))) throw new AppError("Lesson is unavailable", 403);
    }
    next();
  } catch (error) { next(error); }
}
