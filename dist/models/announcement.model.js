import mongoose, { Schema } from "mongoose";
import { AnnouncementStatus } from "../types/announcement.types.js";
const annoucementSchema = new Schema({
    cohort: {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
    },
    audience: {
        type: String,
        required: [true, "audience is required"],
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
    },
    students: {
        type: [Schema.Types.ObjectId],
        ref: "User",
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: [true, "Announcement title is required"],
    },
    summary: {
        type: String,
        required: [true, "summary is required"],
    },
    status: {
        type: String,
        enum: Object.values(AnnouncementStatus),
        default: AnnouncementStatus.PUBLISHED,
    },
    scheduledAt: {
        type: Date,
    },
    views: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
export default mongoose.model("Announcement", annoucementSchema);
