import { NextFunction, Request, Response } from "express";
import { CreateAnnouncement } from "../types/announcement.types.js";
import {
  createAnnouncement,
  getAllAnnounceMents,
  updateAnnouncement,
  deleteAnnouncement,
} from "../services/announcement.service.js";
import { AppError } from "../errors/AppError.js";

interface AuthRequest extends Request {
  user?: { id?: string; role?: string };
}

export const create = async (
  req: AuthRequest,
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
      createdBy: req.user?.id,
      status: req.body.status,
      scheduledAt: req.body.scheduledAt,
    };

    if (cohortId) {
      dataToSend.cohortId = cohortId;
    } else if (courseId) {
      dataToSend.courseId = courseId;
    } else if (students && Array.isArray(students)) {
      dataToSend.students = students;
    } else {
      throw new AppError(
        "Please provide either cohortId, courseId, or students array",
        400,
      );
    }

    const data = await createAnnouncement(dataToSend);
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
    const query = req.query;
    const data = await getAllAnnounceMents(query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const announcementId = req.params.announcementId as string;
    const data = await updateAnnouncement(announcementId, userId, req.user?.role, {
      title: req.body.title,
      summary: req.body.summary,
      status: req.body.status,
      scheduledAt: req.body.scheduledAt,
    });
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

    const announcementId = req.params.announcementId as string;
    await deleteAnnouncement(announcementId, userId, req.user?.role);
    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    next(error);
  }
};
