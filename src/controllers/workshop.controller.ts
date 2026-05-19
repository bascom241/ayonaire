import { Request, Response, NextFunction } from "express";
import { CreateWorkShopRequest } from "../types/workShop.types.js";
import { createWorkShop } from "../services/workShop.service.js";


interface WorkShopAuthRequest extends Request {
  user?: { id?: string };
}
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {title, description, platform, status, startDate, endDate} = req.body;

    const authRequest = req as WorkShopAuthRequest;
    const userId = authRequest.user?.id;

    const dataToSend: CreateWorkShopRequest = {
        title, description,platform,status , startDate, endDate
    }

    const data = await createWorkShop(dataToSend, userId);
    res.status(200).json({success: true , data, message:"WorkShop Created successfully"})
  } catch (err) {
    next(err)
  }
};
