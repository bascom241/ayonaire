import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export interface PaymentRequest {
  courseId: string;

  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zipCode: string;
    country: string;
    email: string;
  };

  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    customerNote?: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    channel: string;
    metadata: {
      studentId: string;
      courseId: string;
      billingAddress: any;
      shippingAddress?: any;
    };
  };
}

export interface PaymentResponse {
  student: Types.ObjectId;
  course: Types.ObjectId;
  enrollment?: Types.ObjectId | null;
  amount: number;
  currency: string;
  reference: string;
  channel?: string | null;
  status: string;
  paidAt?: NativeDate | null;
  orderStatus: string;
}

export interface PaymentHistoryRequest {
  page: number;
  limit: number;
  search?: string;
  order?: "asc" | "desc";
  sortBy?: string;
}

export enum OrderStatus {
  COMPLETED = "Completed",
  PROCESSING = "Processing",
  PENDING_PAYMENT = "Pending_Payment",
  ON_HOLD = "On_Hold",
  CANCELLED = "Cancelled",
}

export interface BulkActionData {
  Completed: string;
  Onhold: string;
  Cancelled: string;
  Revoke: string;
  Refund: string;
  Delete: string;
  Processing: string;
}

export interface EditOrderRequest {
  orderId: string;

  billingAddress?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    zipCode?: string;
    country?: string;
    email?: string;
  };

  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    addressLine1?: string;
    addressLine2?: string;
    customerNote?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface ViewSingleOrderRequest {
  orderId: string;
}
