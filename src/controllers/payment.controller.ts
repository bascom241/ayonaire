import { Request, Response, NextFunction } from "express";
import {
  bulkActionForOrder,
  editOrder,
  handlePaystackWebhook,
  initializePayment,
  payHistory,
  viewSingleOrder
} from "../services/payment.service.js";
import {
  PaymentRequest,
  PaystackWebhookEvent,
  PaymentHistoryRequest,
  EditOrderRequest
} from "../types/payment.types.js";
import crypto from "crypto";
import { AppError } from "../errors/AppError.js";
export interface AuthRequest<T = any> extends Request {
  body: T;
  user?: { id: string; email?: string };
}

export const pay = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    const dataToSend: any  = {
      courseId: req.body.courseId,
    };

    const data = await initializePayment(dataToSend, userId, email);
    res
      .status(200)
      .json({ success: true, message: "Payment initialized", data });
  } catch (error) {
    next(error);
  }
};

export const handlePayWebHook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET;

    if (!paystackSecret) {
      throw new Error("PAYSTACK_SECRET is not set in environment variables");
    }

    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.sendStatus(401);
    }

    const webhookEvent: PaystackWebhookEvent = {
      event: req.body.event,
      data: {
        reference: req.body.data.reference,
        channel: req.body.data.channel,
        metadata: {
          studentId: req.body.data.metadata.studentId,
          courseId: req.body.data.metadata.courseId,

          billingAddress: req.body.data.metadata.billingAddress,
          shippingAddress:req.body.data.metadata.shippingAddress
        },
      },
    };

 
    await handlePaystackWebhook(webhookEvent);

    return res.sendStatus(200);
  } catch (error) {
     console.error("Paystack webhook error:", error);
    res.sendStatus(500);
    
  }
};


export const paymentHistory = async (req: Request , res: Response , next : NextFunction )  => {
  try {
 const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const order =
      req.query.order === "asc" || req.query.order === "desc"
        ? req.query.order
        : "desc";
    const sortBy =
      typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";

    const dataToSend: PaymentHistoryRequest = {
      page,
      limit,
      search,
      order,
      sortBy,
    };

    const data = await payHistory(dataToSend);
    res.status(200).json({success: true, data})
  } catch (error) {
    next(error)
  }
}

export interface BulkActionData {
  Completed: string
  Onhold:string
  Cancelled: string
  Revoke:string
  Refund: string 
  Delete: string
  Processing: string
}


export const bulkEdit = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const dataToSend:BulkActionData = {
      Completed: req.body.completed,
      Onhold:req.body.completed,
      Cancelled: req.body.cancelled,
      Revoke:req.body.revoke,
      Refund:req.body.refund,
      Delete: req.body.delete,
      Processing:req.body.processing
    }

    const data = await bulkActionForOrder(dataToSend);

    res.status(200).json ({success: true, data})
  } catch (error) {
    next(error)
  }
} 


interface EditOrderAuthRequest extends AuthRequest {
  body:EditOrderRequest
  user?: { id: string };
}
export const edit = async (req:EditOrderAuthRequest, res: Response, next: NextFunction) => {
  try {
     const userId = req.user?.id;
     
     const dataToSend: EditOrderRequest = {
      orderId: req.body.orderId,
      billingAddress: req.body.billingAddress,
      shippingAddress: req.body.shippingAddress
     }
     const data = await editOrder(dataToSend, userId);
     res.status(200).json({success: true, data})
  } catch (error) {
    next(error)
  }
}

export const viewSingle = async(req:Request, res: Response, next:NextFunction) => {
  try {
    const {orderId} = req.params;

    if(!orderId || typeof orderId !== "string"){
      throw new AppError("order id is missing or Invalid format", 400)
    };

    const data = await viewSingleOrder({orderId});
    res.status(200).json({success: true,data})
  } catch (error) {
    next(error)
  }
}