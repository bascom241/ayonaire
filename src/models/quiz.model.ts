import mongoose, { Schema } from "mongoose";

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
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref:"Question"
    }
  ],
}, {timestamps: true });

export default mongoose.model("Quiz", quizSchema);
