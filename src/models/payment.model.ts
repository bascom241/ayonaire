import mongoose, { Schema } from "mongoose";
import { OrderStatus, PaymentStatus } from "../types/payment.types.js";

const paymentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    reference: {
      type: String,
      required: true,
      unique: true,
    },

    channel: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PROCESSING,
    },

    paidAt: Date,

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Embedded Billing Address (no separate schema)
    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      zipCode: String,
      country: String,
      email: String,
      paymentMethod: {
        type: String,
        default: "paystack",
      },
    },

    //  Embedded Shipping Address (optional)
    shippingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      addressLine1: String,
      addressLine2: String,
      customerNote: String,
      city: String,
      zipCode: String,
      country: String,
    },

    notes: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User" },
        content: String,
        isPrivate: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
