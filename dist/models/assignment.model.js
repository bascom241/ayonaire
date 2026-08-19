import mongoose, { Schema } from "mongoose";
import { AssignmentStatus, AssignmentType } from "../types/assignment.types.js";
const assignmentSchema = new Schema({
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
        required: [true, "Instructor Id is required"],
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course Id is Required to create an assignment"],
    },
    cohort: {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
    },
    title: {
        type: String,
        required: [true, "Assignment Title is required"],
    },
    description: {
        type: String,
        required: [true, "Assignment Description is required"],
    },
    instructions: {
        type: String,
    },
    materials: [
        {
            title: String,
            url: String,
            publicId: String,
        },
    ],
    module: {
        type: Schema.Types.ObjectId,
        ref: "Module",
        required: [true, "Module is is required "],
    },
    assignmentType: {
        type: String,
        enum: Object.values(AssignmentType),
        default: AssignmentType.DOCUMENT,
    },
    status: {
        type: String,
        enum: Object.values(AssignmentStatus),
        default: AssignmentStatus.DRAFT,
    },
    dueDate: {
        type: Date,
    },
    totalPoints: {
        type: Number,
        default: 100,
    },
    allowedFileTypes: [String],
}, { timestamps: true });
export default mongoose.model("Assignments", assignmentSchema);
