import mongoose, { Schema } from "mongoose";
const moduleSchema = new Schema({
    title: {
        type: String,
        required: [true, "module title is required"],
    },
    description: {
        type: String,
        required: [true, "module description is required"],
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    order: { type: Number, required: true },
    lessons: [
        {
            type: Schema.Types.ObjectId,
            ref: "Lesson",
        },
    ],
    assignment: {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
    },
    quizzes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
        },
    ],
}, { timestamps: true });
export default mongoose.model("Module", moduleSchema);
