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
  name: string;
  email: string;
  loginHistory: loginHistory[];
  activity: Activity[];
};

export interface InstructorProfileResponse {
  instructorId: instructorIdPopulatedData;
  bio: string;
  expertise: string[];
  instructorCourseCategory: string;
  applicationStatus: string;
}
