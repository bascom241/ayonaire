import { Types } from "mongoose";
import { UploadLessonResponse } from "./lesson.types.js";
export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface EnrollmentRequest {
  student: Types.ObjectId;
  course: Types.ObjectId;
}

export interface EnrolledStudentPerCourse {
  name: string;
  email: string;
}

export interface EnrollmentData {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
  };
  progress: number;
  completed: boolean;
  status: string;
  createdAt: Date;
}

export interface MarkLessonCompletedEnrollmentResponse {
  course: string 
  student: string 
  status: string 
  completedLessons : string []
  progress: number 
  completed: boolean 

}

export interface StudentProgressPerCourse{
  progress: number;
  completedLessons: string[];
  completed: boolean;
}


/// ---- for student enrolled courses ------ ////


export interface AttachedEnrolledCourseInstructor {
  name: string 
}

export interface AttachedEnrolledCourse {
    title: string 
    description: string 
    instructor : AttachedEnrolledCourseInstructor
}

export interface StudentEnrolledCourses {
  course : AttachedEnrolledCourse
  status: string 
  completedLessons:  [Types.ObjectId]
  progress: number
  completed: boolean 
  
}
