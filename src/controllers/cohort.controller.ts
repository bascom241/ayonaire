import { NextFunction, Request, Response } from "express";
import {
  assignInstructorToCohort,
  assignStudentToCohort,
  createCohort,
} from "../services/cohort.service.js";
import {
  AssignInstructorRequest,
  AssignStudentRequest,
  CreateCohortRequest,
} from "../types/cohort.types.js";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, course, creator, isActive, description } = req.body;
    const dataToSend: CreateCohortRequest = {
      name,
      course,
      creator,
      isActive,
      description,
    };

    const data = await createCohort(dataToSend);
    res.status(201).json({ success: true, message: "cohort created", data });
  } catch (error) {
    next(error);
  }
};

export const assign = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, cohortId } = req.body;
    const dataToSend: AssignStudentRequest = {
      userId,
      cohortId,
    };

    const data = await assignStudentToCohort(dataToSend);

    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};

export const assignInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { instructorId, cohortId } = req.body;
    const dataToSend: AssignInstructorRequest = {
      instructorId,
      cohortId,
    };

    const data = await assignInstructorToCohort(dataToSend);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};
