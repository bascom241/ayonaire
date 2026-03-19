import { Types } from "mongoose";

export interface LessonVideo {
  title: string;
  url: string; // Cloudinary secure_url whic i provide
  publicId: string; // Cloudinary public_id
  duration: number;
}

export interface LessonMaterial {
  name: string;
  url: string;
  publicId: string;
}

export interface Lesson {
  _id?: Types.ObjectId;

  title: string;

  module: Types.ObjectId;
  course: Types.ObjectId;

  order: number;
  duration?: number;

  isPublished: boolean;
  isFreePreview: boolean;
  isLocked: boolean;

  videos: LessonVideo[];
  materials: LessonMaterial[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface UploadLessonRequest {
  title: string;
  module: string;
  course: string;
  order: number;
  isPublished?: boolean;
  isFreePreview?: boolean;
  isLocked?: boolean;
}

export interface UploadLessonResponse {
  _id?: string;
  title: string;
  module: string;
  course: string;
  order: number;
  isPublished: boolean;
  isFreePreview: boolean;
  isLocked: boolean;
  videos?: {
    title: string;
    url: string; // Cloudinary secure_url whic i provide
    publicId: string; // Cloudinary public_id
    duration: number;
  };
  materials?: {
    name: string;
    url: string;
    publicId: string;
  };
}

export interface VideoData {
  title: string;
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}
export interface UploadVideoRequest {
  videos: VideoData[];
}

export interface UploadVideoReponse {
  title: string[];
  url: string[];
  publicId: string[];
  duration: number[];
}


export interface MarkLessonCompleted {
  studentId: string 
  courseId: string 
  lessonId: Types.ObjectId
}


export interface UpdateLastLesson {
   studentId: string 
  courseId: string 
  lessonId: Types.ObjectId
}

export interface ResumeLessonRequest{
   studentId: string 
  courseId: string 
}

export interface UpdateLastLessonResponse {
    course: string 
  student: string 
  status: string 
  completedLessons : string []
  progress: number 
  completed: boolean 
  lastLesson: string | null 

}


export interface LessonCompletedEnrollment {
  
}

export interface ViewLessonRequest {
  courseId: string
  studentId: string 
  lessonId?: string 
}


export interface LessonContentResponse {
  videos?: {
    title: string;
    url: string; // Cloudinary secure_url whic i provide
    publicId: string; // Cloudinary public_id
    duration: number;
  };
  materials?: {
    name: string;
    url: string;
    publicId: string;
  };
}