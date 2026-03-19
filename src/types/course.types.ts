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
  url: string;
  publicId: string;
  duration: number;
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
  introVideo: IntroVideo;
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
  introVideo: introVideoData;
  instructor?: string;
  price: number;
  status: string;
  courseLevel: string;
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
  introVideo: {
    url: string;
    publicId: string;
    duration: number 
  };
}
