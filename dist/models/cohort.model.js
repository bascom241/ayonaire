import mongoose, { Schema } from "mongoose";
const cohortSchema = new Schema({
    name: { type: String, required: [true, "cohort name is required"] },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Atleast a course is required"]
    },
    students: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
export default mongoose.model("Cohort", cohortSchema);
