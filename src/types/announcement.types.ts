import { Types } from "mongoose";

export interface CreateAnnouncement {
  students?: string[];
  cohortId?: Types.ObjectId;
  courseId?: Types.ObjectId;
  title: string;
  summary: string;
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
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
