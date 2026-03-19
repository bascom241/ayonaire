import { Types } from "mongoose";

export interface Module {
  title: string;
  description: string;
  course: Types.ObjectId;
  order: number;
  lessons: [Types.ObjectId];
  quizzes: [Types.ObjectId];
  assignment: Types.ObjectId
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CreateModuleRequest {
   title: string;
  description: string;
  courseId: string ;
  order: number;
}

export interface CreateModuleResponse {
  _id: string
  title: string;
  description: string;
  order: number;
  lessons: string[];
  createdAt?: Date;
  updatedAt?: Date;
}