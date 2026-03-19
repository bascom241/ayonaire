import mongoose, { Schema } from "mongoose";
import { EnrollmentStatus } from "../types/enrollment.types.js";

const enrollmentSchema = new Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "course Id is required"],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    enum: Object.values(EnrollmentStatus),
    default: EnrollmentStatus.ACTIVE,
  },
  
  comletedLessons: [
    {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  progress: {
    type: Number,
    default: 0,
  },

  completed: {
    type: Boolean,
    default: false,
  },
  lastLesson: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Lesson"
}

},{ timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);
