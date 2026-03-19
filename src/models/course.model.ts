import mongoose, { Schema } from "mongoose";
import { Course, CourseStatus, CourseLevel } from "../types/course.types.js";

const courseSchema = new Schema<Course>({
  title: {
    type: String,
    required: [true, "course name is required"],
  },
  thumbnail: {
    type: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    required: [true, "Course image is required"],
  },
  introVideo: {
    type: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      duration: { type: Number, required: true },
    },
  },

  description: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "CourseCategory",
    required: [true, "course category is required"],
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },
  price: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(CourseStatus),
    default: CourseStatus.DRAFT,
  },

  courseLevel: {
    type: String,
    enum: Object.values(CourseLevel),
    default: CourseLevel.BEGINNER,
  },

  modules: [
    {
      type: Schema.Types.ObjectId,
      ref: "Module",
    },
  ],
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  completionCount: {
    type: Number,
    default: 0,
  },
  cohorts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
    },
  ],
  completionCertificate: {
    type: Boolean,
    default: false,
  },
  enrollments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
    },
  ],
});

export default mongoose.model("Course", courseSchema);
