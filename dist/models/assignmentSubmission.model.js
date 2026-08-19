import mongoose, { Schema } from "mongoose";
import { SubmissionStatus } from "../types/assignment.types.js";
const assignmentSubmissionSchema = new Schema({
    assignment: {
        type: Schema.Types.ObjectId,
        ref: "Assignments",
        required: [true, "assignment id is required"],
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "student id is required"],
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "course id is required"],
    },
    text: {
        type: String,
    },
    file: {
        url: String,
        publicId: String,
        name: String,
    },
    status: {
        type: String,
        enum: Object.values(SubmissionStatus),
        default: SubmissionStatus.SUBMITTED,
    },
    grade: {
        type: Number,
    },
    feedback: {
        type: String,
    },
    gradedAt: {
        type: Date,
    },
    gradedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
export default mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
