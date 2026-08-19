import mongoose, { Schema } from "mongoose";
import { AttendanceRecordStatus, AttendanceApprovalStatus, } from "../types/attendance.types.js";
const attendanceRecordSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(AttendanceRecordStatus),
        default: AttendanceRecordStatus.UNMARKED,
    },
    timeIn: String,
    timeOut: String,
    source: {
        type: String,
        enum: ["device", "manual"],
        default: "manual",
    },
    notes: String,
}, { _id: false });
const attendanceSessionSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "course is required"],
    },
    cohort: {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
    },
    title: {
        type: String,
        required: [true, "session title is required"],
    },
    date: {
        type: Date,
        required: [true, "date is required"],
    },
    records: [attendanceRecordSchema],
    approvalStatus: {
        type: String,
        enum: Object.values(AttendanceApprovalStatus),
        default: AttendanceApprovalStatus.PENDING,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
export default mongoose.model("AttendanceSession", attendanceSessionSchema);
