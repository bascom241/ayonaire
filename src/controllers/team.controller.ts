import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  listTeamMembers,
  inviteTeamMember,
  updateTeamMemberRole,
  suspendTeamMember,
  removeTeamMember,
} from "../services/team.service.js";

interface AuthRequest extends Request {
  user?: { id?: string };
}

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await listTeamMembers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const invite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, role } = req.body;
    const data = await inviteTeamMember(email, role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    if (!role) throw new AppError("role is required", 400);

    const data = await updateTeamMemberRole(id, role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const suspend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const data = await suspendTeamMember(id);
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
    const requesterId = req.user?.id;
    if (!requesterId) throw new AppError("Unauthorized", 401);

    const id = req.params.id as string;
    await removeTeamMember(id, requesterId);
    res.status(200).json({ success: true, message: "Team member removed" });
  } catch (error) {
    next(error);
  }
};
