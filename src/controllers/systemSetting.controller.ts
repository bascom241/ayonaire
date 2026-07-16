import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  getAllSettings,
  getSettingsByCategory,
  updateSettingsByCategory,
} from "../services/systemSetting.service.js";

interface AuthRequest extends Request {
  user?: { id?: string };
}

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAllSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = req.params.category as string;
    const data = await getSettingsByCategory(category);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const category = req.params.category as string;
    const data = await updateSettingsByCategory(category, userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
