import mongoose, { Types } from "mongoose";
import { loginHistory, Activity } from "./user.types.js";
export enum InstructorApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Instructor {
  instructorId: Types.ObjectId;
  instructorCourseCategory: Types.ObjectId;
  bio: string;
  expertise: [string];
  applicationStatus: InstructorApplicationStatus;
  courses: [Types.ObjectId];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface instructorRequest {
  bio: string;
  expertise: [string];
  instructorCourseCategory: string;
}

type instructorIdPopulatedData = {
  _id: string;
  name: string;
  email: string;
  loginHistory: loginHistory[];
  activity: Activity[];
  profile?: {
    url: string;
    publicId: string;
  } | null;
};

export interface InstructorProfileResponse {
  _id?: string;
  instructorId: instructorIdPopulatedData;
  bio: string;
  expertise: string[];
  instructorCourseCategory: string;
  applicationStatus: string;
  courses?: unknown[];
  createdAt?: Date;
  updatedAt?: Date;
}
