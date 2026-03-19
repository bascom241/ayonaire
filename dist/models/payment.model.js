import mongoose, { Schema } from "mongoose";
import { PaymentStatus } from "../types/payment.types.js";
const paymentSchema = new Schema({
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
    paidAt: Date,
}, { timestamps: true });
export default mongoose.model("Payment", paymentSchema);
