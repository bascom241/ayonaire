import { NextFunction, Request, Response } from "express";
import { CreateAnnouncement } from "../types/announcement.types.js";
import { createAnnouncement } from "../services/announcement.service.js";
import { AppError } from "../errors/AppError.js";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, summary, cohortId, courseId, students } = req.body;
    
    
    if (!title || !summary) {
      throw new AppError("Title and summary are required", 400);
    }
    
   
    const dataToSend: CreateAnnouncement = {
      title,
      summary,
    };
    
    
    if (cohortId) {
      dataToSend.cohortId = cohortId;
    } else if (courseId) {
      dataToSend.courseId = courseId;
    } else if (students && Array.isArray(students)) {
      dataToSend.students = students;
    } else {
      throw new AppError("Please provide either cohortId, courseId, or students array", 400);
    }
    
    const data = await createAnnouncement(dataToSend);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};