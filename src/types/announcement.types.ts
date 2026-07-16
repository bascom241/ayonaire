import { Types } from "mongoose";

export enum AnnouncementStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
}

export interface CreateAnnouncement {
  students?: string[];
  cohortId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  title: string;
  summary: string;
  createdBy?: string;
  status?: string;
  scheduledAt?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  summary?: string;
  status?: string;
  scheduledAt?: string;
}

export interface CreateAnnouncementResponse {
  id: string;
  audience: string;
  title: string;
  summary: string;
}

export interface AnnouncementResponse {
  announcement: {
    id: string;
    audience: string;
    title: string;
    summary: string;
    course?: string | null;
    cohort?: string | null;
    createdBy?: string | null;
    status: string;
    views: number;
    createdAt?: Date;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
