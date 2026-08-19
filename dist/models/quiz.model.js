import mongoose, { Schema } from "mongoose";
import { QuizStatus } from "../types/quiz.types.js";
export const quizSchema = new Schema({
    title: {
        type: String,
        required: [true, "quiz title is required"],
    },
    module: {
        type: Schema.Types.ObjectId,
        ref: "Module",
        required: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    randomizeQuestions: {
        type: Boolean,
        default: false,
    },
    showCorrectAnswers: {
        type: Boolean,
        default: false,
    },
    allowRetakes: {
        type: Boolean,
        default: false,
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: Object.values(QuizStatus),
        default: QuizStatus.ACTIVE,
    },
    dueDate: {
        type: Date,
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Question",
        },
    ],
}, { timestamps: true });
export default mongoose.model("Quiz", quizSchema);
