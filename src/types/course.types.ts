import { Types } from "mongoose";
import { CourseCategory } from "./category.types.js";

export interface CourseMaterial {}

export enum CourseStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  ARCHIVED = "Archived",
}
export enum CourseLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

export interface IntroVideo {
  title?: string;
  url: string;
  publicId?: string;
  duration: number;
  sourceType?: "upload" | "url";
  provider?:
    | "cloudinary"
    | "youtube"
    | "vimeo"
    | "mux"
    | "bunny"
    | "cloudflare"
    | "external";
}

export interface Thumbnail {
  url: string;
  publicId: string;
}

export interface Course {
  title: string;
  description: string;
  category: Types.ObjectId;
  thumbnail: Thumbnail;
  introVideo?: IntroVideo;
  instructor: Types.ObjectId;
  price: number;
  status: CourseStatus;
  students: [Types.ObjectId];
  completionCount: number;
  modules: [Types.ObjectId];
  cohorts: [Types.ObjectId];
  enrollments: [Types.ObjectId];
  completionCertificate: boolean;
  courseLevel: CourseLevel;
}

export interface thumbnailData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface introVideoData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  thumbnail: thumbnailData;
  introVideo?: introVideoData;
  introVideoUrl?: string;
  introVideoTitle?: string;
  introVideoProvider?: IntroVideo["provider"];
  introVideoDuration?: number;
  instructor?: string;
  price: number;
  status: string;
  courseLevel: string;
  completionCertificate?: boolean;
}
export interface CreateCourseResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor?: string;
  price: number;
  status: string;
  courseLevel: string;
  thumbnail: {
    url: string;
    publicId: string;
  };
  completionCertificate: boolean;
  students?: string[];
  completionCount?: number;
  modules?: string[];
  cohorts?: string[];
  enrollments: string[];
  introVideo?: {
    title?: string;
    url: string;
    publicId?: string;
    duration: number;
    sourceType?: "upload" | "url";
    provider?: IntroVideo["provider"];
  };
}

export interface AllAdminCourse {
  courses: {
    _id: string;
    title: string;
    category: string;
    description: string;
    instructor?: string;
    price: number;
    status: string;
    enrollments: number;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleAdminCourse {
  _id: string;
  title: string;
  category: string;
  description: string;
  instructor?: string;
  price: number;
  status: string;
}
