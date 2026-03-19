import { Types } from "mongoose";

export enum PaymentStatus {
    PENDING="pending",
    SUCCESS="success",
    FAILED="failed"
}

export interface PaymentRequest {
    courseId: string 
}


export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    channel: string;
    metadata: {
      studentId: string;
      courseId: string;
    };
  };
}

export interface PaymentResponse {
    student: Types.ObjectId
    course: Types.ObjectId
    enrollment?: Types.ObjectId | null
    amount: number 
    currency: string 
    reference: string 
    channel?: string | null 
    status: string 
    paidAt?:NativeDate | null
}


export interface PaymentHistoryRequest {
  page: number;
  limit: number;
  search?: string;
  order?: "asc" | "desc";
  sortBy?: string;

}