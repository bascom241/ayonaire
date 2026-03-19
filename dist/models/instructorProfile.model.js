import mongoose, { Schema } from "mongoose";
import { InstructorApplicationStatus } from "../types/instructor.types.js";
const instructorSchema = new Schema({
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Instructor Id is Required"],
        unique: true
    },
    bio: String,
    expertise: [String],
    instructorCourseCategory: {
        type: Schema.Types.ObjectId,
        ref: "CourseCategory",
        required: true,
    },
    applicationStatus: {
        type: String,
        enum: Object.values(InstructorApplicationStatus),
        default: InstructorApplicationStatus.PENDING
    },
    courses: [
        {
            type: Schema.Types.ObjectId,
            ref: "Course"
        }
    ]
}, { timestamps: true });
export default mongoose.model("Instructor", instructorSchema);
