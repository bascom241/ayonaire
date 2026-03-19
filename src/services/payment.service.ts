import mongoose, { PipelineStage } from "mongoose";

import {
  PaymentRequest,
  PaymentStatus,
  PaystackWebhookEvent,
  PaymentResponse,
  PaymentHistoryRequest
} from "../types/payment.types.js";
import paymentModel from "../models/payment.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import axios from "axios";

export const initializePayment = async (
  data: PaymentRequest,
  userId: string | undefined,
  email: string | undefined,
) => {
  console.log(data, userId, email);
  const paymentData: any = {
    course: new mongoose.Types.ObjectId(data.courseId),
  };

  const course = await courseModel.findById(paymentData.course).select("price");

  if (!course) {
    throw new AppError("course does not exists", 400);
  }

  const enrollment = await enrollmentModel.findOne({
    course: paymentData.course,
    student: userId,
  });

  if (enrollment) {
    throw new AppError("user already enrolled for this course", 400);
  }

  const successfulPayment = await paymentModel.findOne({
    student: userId,
    course: paymentData.courseId,
    status: PaymentStatus.SUCCESS,
  });

  if (successfulPayment) {
    throw new AppError("Course alraedy Paid for", 400);
  }

  const pendingPayment = await paymentModel.findOne({
    student: userId,
    course: paymentData.courseId,
    status: PaymentStatus.FAILED,
  });

  if (pendingPayment) {
    throw new AppError("Pending payment exits for this course", 400);
  }
  const reference = "AYONAIRE-" + Date.now();

  console.log(reference);
  console.log(process.env.PAYSTACK_SECRET);

  /// failed here
  let payment;
  try {
    payment = await paymentModel.create({
      student: new mongoose.Types.ObjectId(userId),
      course: paymentData.course,
      amount: course.price,
      reference,
      status: PaymentStatus.PENDING,
    });
  } catch (err: any) {
    console.error("Payment create error:", err.message);
    throw new AppError("Failed to create payment record", 500);
  }
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: payment.amount * 100,
      reference,
      metadata: {
        studentId: userId?.toString(),
        courseId: paymentData.course.toString(),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    },
  );

  return response.data.data.authorization_url;
};

export const handlePaystackWebhook = async (
  event: PaystackWebhookEvent,
): Promise<PaymentResponse | void> => {
  if (event.event !== "charge.success") {
    return;
  }

  const { reference, metadata, channel } = event.data;
  const payment = await paymentModel.findOne({ reference });
  if (!payment) {
    throw new AppError("payment not found", 400);
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return {
      student: payment.student,
      course: payment.course,
      enrollment: payment.enrollment,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference,
      channel: payment.channel,
      status: payment.status,
      paidAt: payment.paidAt,
    };
  }

  if (
    payment.course.toString() !== metadata.courseId ||
    payment.student.toString() !== metadata.studentId
  ) {
    throw new AppError("metadata mismatch", 400);
  }

  payment.status = PaymentStatus.SUCCESS;
  payment.channel = channel;
  payment.paidAt = new Date();
  await payment.save();

  const existingEnrollment = await enrollmentModel.findOne({
    student: payment.student,
    course: payment.course,
  });

  if (!existingEnrollment) {
    const enrollment = await enrollmentModel.create({
      student: payment.student,
      course: payment.course,
    });

    payment.enrollment = enrollment._id;
    await payment.save();
  }

  await courseModel.findByIdAndUpdate(metadata.courseId, {
    $push: {
      students: metadata.studentId,
    },
  });

  return {
    student: payment.student,
    course: payment.course,
    enrollment: payment.enrollment,
    amount: payment.amount,
    currency: payment.currency,
    reference: payment.reference,
    channel: payment.channel,
    status: payment.status,
    paidAt: payment.paidAt,
  };
};

export const payHistory = async (data: PaymentHistoryRequest) => {
  const { page, limit, search, order, sortBy } = data;

  const skip = (page - 1) * limit;

  let pipeline: PipelineStage[] = [];

  // Pipline for student name
  pipeline.push({
    $lookup: {
      from: "users",
       let: {studentId: "$student"},
       pipeline : [
        {
          $match: {
            $expr: {$eq: ["$_id", "$$studentId"]}
          }
        },
        {
          $project : {
            _id: 1 ,
            name : 1 ,
            email: 1 
          }
        }
       ],
      // localField: "student",
      // foreignField: "_id",
      as: "student",
    },
  });

  pipeline.push({ $unwind: "$student" });

  // pipeine for course title
  pipeline.push({
    $lookup: {
      from: "courses",
      let: {courseId: "$course"},
      pipeline: [
        {
          $match : {
            $expr: {$eq: ["$_id", "$$courseId"]}
          }
        }, 
        {
          $project : {
            _id: 1 ,
            title: 1
          }
        }
      ],
      // localField: "course",
      // foreignField: "_id",
      as: "course",
    },
  });

  pipeline.push({ $unwind: "$course" });

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "student.name": { $regex: search, $options: "i" } },
          { "course.title": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({
    $sort: { createdAt: order === "asc" ? 1 : -1 },
  });

  // Pagination
  pipeline.push({ $skip: skip } );
  pipeline.push({ $limit: limit });

    const payments = await paymentModel.aggregate(pipeline);

   const total = await paymentModel.aggregate([
    ...pipeline.slice(0, -2), // remove skip + limit
    { $count: "total" }
  ]);

  return {
    data: payments,
    total: total[0]?.total || 0,
    page,
    limit
  };
};
