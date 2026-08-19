import mongoose, { Schema } from "mongoose";
const pricingPlanSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "course is required"],
    },
    planType: {
        type: String,
        enum: ["one-time", "subscription", "installment"],
        default: "one-time",
    },
    price: {
        type: Number,
        required: [true, "price is required"],
    },
    duration: {
        type: String,
        default: "Lifetime",
    },
    accessType: {
        type: String,
        enum: ["full", "limited"],
        default: "full",
    },
    status: {
        type: String,
        enum: ["active", "draft"],
        default: "active",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
export default mongoose.model("PricingPlan", pricingPlanSchema);
