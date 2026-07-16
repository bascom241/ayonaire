import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  issueCertificateManually,
  listCertificates,
  getMyCertificates,
  verifyCertificate,
  revokeCertificate,
} from "../services/certificate.service.js";

interface AuthRequest extends Request {
  user?: { id?: string };
}

export const issue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      throw new AppError("studentId and courseId are required", 400);
    }

    const data = await issueCertificateManually(studentId, courseId);
    res.status(201).json({ success: true, data });
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
    const data = await listCertificates(req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) throw new AppError("Unauthorized", 401);

    const data = await getMyCertificates(studentId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const certificateId = req.params.certificateId as string;
    const data = await verifyCertificate(certificateId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const revoke = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const data = await revokeCertificate(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
