import { NextFunction, Request, Response } from "express";
import { createModule } from "../services/module.service.js";
import { CreateModuleRequest } from "../types/module.types.js";
import { AppError } from "../errors/AppError.js";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, title, description, order } = req.body;
    if (!courseId || !title || !description || !order) {
      throw new AppError("courseId title description are required", 400);
    }

    const dataToSend: CreateModuleRequest = {
      courseId: req.body.courseId,
      title: req.body.title,
      description: req.body.description,
      order: req.body.order,
    };
    const data = await createModule(dataToSend);
    res
      .status(201)
      .json({ success: true, data, message: "module created successfully" });
  } catch (error) {
    next(error);
  }
};
