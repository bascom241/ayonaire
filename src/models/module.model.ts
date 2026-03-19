import mongoose, { Schema } from "mongoose";
import { Module } from "../types/module.types.js";

const moduleSchema = new Schema<Module>(
  {
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
  },
  { timestamps: true },
);

export default mongoose.model("Module", moduleSchema);
