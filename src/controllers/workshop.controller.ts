import { Request, Response, NextFunction } from "express";
import {
  CreateWorkShopRequest,
  EditWorkShopRequest,
  GetAllWorkShopsResponse,
} from "../types/workShop.types.js";
import {
  createWorkShop,
  editWorkShop,
  getAllWorkShops,
} from "../services/workShop.service.js";

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

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      platform,
      status,
      startDate,
      endDate,
   
    } = req.body;


    const id = req.params as any 

    const authRequest = req as WorkShopAuthRequest;
    const userId = authRequest.user?.id;

    const dataToSend: EditWorkShopRequest = {
      title,
      description,
      platform,
      status,
      startDate,
      endDate,
      workShopId:id,
    };

    const data = await editWorkShop(dataToSend, userId);
    res.status(200).json({success:true, data})
  } catch (error) {
    next(error)
  }
};
