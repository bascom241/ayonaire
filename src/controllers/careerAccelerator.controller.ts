import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  saveFreelanceProfile,
  generateAiResume,
  generateCareerRoadmap,
  generateCompanyInterview,
  generateCoverLetter,
  generatePortfolio,
  generateAIInterview,
  getTalentMarketplace,
  importLinkedInProfile,
  analyzeSkillGap,
  buildResume,
  searchAyonaireJobs,
} from "../services/careerAccelerator.service.js";

export const generateResumeApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generateAiResume(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetterApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generateCoverLetter(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAyonaireJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await searchAyonaireJobs(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const importLinkedIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await importLinkedInProfile(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generatePortfolioApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generatePortfolio(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const buildResumeApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await buildResume(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const analyzeSkillGapApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await analyzeSkillGap(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getTalentMarketplaceApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getTalentMarketplace(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createFreelanceProfileApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const data = await saveFreelanceProfile(userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generateCareerRoadmapApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generateCareerRoadmap(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generateAIInterviewApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generateAIInterview(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generateCompanyInterviewApi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await generateCompanyInterview(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};