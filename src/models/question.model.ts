import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
    required: [true, "quiz id is required"],
  },
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
    multipleCorrectAnswer: {
    type: Boolean,
    default: false
  },

  randomizeChoice: {
    type: Boolean,
    default: false
  },

  points: {
    type: Number,
    default: 1
  }
},{timestamps: true });

export default mongoose.model("Question", questionSchema);
