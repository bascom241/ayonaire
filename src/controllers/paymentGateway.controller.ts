import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  listGateways,
  connectGateway,
  updateGateway,
  disconnectGateway,
  setPrimaryGateway,
  listPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from "../services/paymentGateway.service.js";

interface AuthRequest extends Request {
  user?: { id?: string };
}

export const getGateways = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await listGateways();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const connect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await connectGateway(userId, req.body);
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
    const name = req.params.name as string;
    const data = await updateGateway(name, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const disconnect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name = req.params.name as string;
    const data = await disconnectGateway(name);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const setPrimary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const name = req.params.name as string;
    const data = await setPrimaryGateway(name);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPricingPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await listPricingPlans(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const data = await createPricingPlan(userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const planId = req.params.planId as string;
    const data = await updatePricingPlan(planId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const planId = req.params.planId as string;
    await deletePricingPlan(planId);
    res.status(200).json({ success: true, message: "Pricing plan deleted" });
  } catch (error) {
    next(error);
  }
};
