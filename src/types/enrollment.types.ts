import { Types } from "mongoose";
import { UploadLessonResponse } from "./lesson.types.js";

/* Active*/
/*
This means a student was enrolled in a course maybe by an admin where by the enrollment status by default is Active
At this stage the student cannot view the content of the course.
Active means ---> student has been enrolled but has not yet paid for the course 
*/

/* Complted*/
/*
This means a student has may or not be enrolled for the course by the instructor .. once the student pays the enrollment status is changed
to completed --> completed means student has paid fro the course.
*/
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
  course: string;
  student: string;
  status: string;
  completedLessons: string[];
  progress: number;
  completed: boolean;
}

export interface StudentProgressPerCourse {
  progress: number;
  completedLessons: string[];
  completed: boolean;
}

/// ---- for student enrolled courses ------ ////

export interface AttachedEnrolledCourseInstructor {
  name: string;
}

export interface AttachedEnrolledCourse {
  title: string;
  description: string;
  instructor: AttachedEnrolledCourseInstructor;
}

export interface StudentEnrolledCourses {
  course: AttachedEnrolledCourse;
  status: string;
  completedLessons: [Types.ObjectId];
  progress: number;
  completed: boolean;
}

export interface StudentCourseDetail {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  category?: string;
  instructor?: {
    id: string;
    name: string;
  } | null;
  price: number;
  courseLevel: string;
  status: string;
  progress: number;
  completed: boolean;
  completedLessons: string[];
  lastLesson: string | null;
  enrolledAt: Date;
}
