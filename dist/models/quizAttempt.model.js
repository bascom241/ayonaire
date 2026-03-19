import mongoose, { Schema } from "mongoose";
const quizAttemptSchema = new Schema({
    quiz: {
        type: Schema.Types.ObjectId,
        ref: "Quiz"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    answers: [
        {
            question: {
                type: Schema.Types.ObjectId,
                ref: "Question"
            },
            selectedOptions: [String],
            isCorrect: Boolean
        }
    ],
    score: Number,
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export default mongoose.model("QuizAttempt", quizAttemptSchema);
