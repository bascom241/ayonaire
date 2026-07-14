import { Request, Response, NextFunction } from "express";
import {
  CreateWorkShopRequest,
  DeleteWorkShopRequest,
  EditWorkShopRequest,
  GetAllWorkShopsResponse,
} from "../types/workShop.types.js";
import {
  createWorkShop,
  deleteWorkShop,
  editWorkShop,
  getAllWorkShops,
  getWorkShopById,
} from "../services/workShop.service.js";
import { AppError } from "../errors/AppError.js";

interface WorkShopAuthRequest extends Request {
  user?: { id?: string };
}
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, platform, status, startDate, endDate } =
      req.body;

    const authRequest = req as WorkShopAuthRequest;
    const userId = authRequest.user?.id;

    const dataToSend: CreateWorkShopRequest = {
      title,
      description,
      platform,
      status,
      startDate,
      endDate,
    };

    const data = await createWorkShop(dataToSend, userId);
    res
      .status(200)
      .json({ success: true, data, message: "WorkShop Created successfully" });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllWorkShops(req.query);
    return res
      .status(200)
      .json({ success: true, data, message: "Workshops fetched successfully" });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      throw new AppError("Workshop id is required", 400);
    }
    const data = await getWorkShopById(id);
    res
      .status(200)
      .json({ success: true, data, message: "Workshop fetched successfully" });
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, platform, status, startDate, endDate } =
      req.body;

    const id = req.params.id;
    if (!id || typeof id !== "string") {
      throw new Error("Workshop id is required");
    }

    const authRequest = req as WorkShopAuthRequest;
    const userId = authRequest.user?.id;

    const dataToSend: EditWorkShopRequest = {
      title,
      description,
      platform,
      status,
      startDate,
      endDate,
      workShopId: id,
    };

    const data = await editWorkShop(dataToSend, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      throw new AppError("Workshop id is required", 400);
    }

    const dataToSend: DeleteWorkShopRequest = { workShopId: id };
    const data = await deleteWorkShop(dataToSend);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};
