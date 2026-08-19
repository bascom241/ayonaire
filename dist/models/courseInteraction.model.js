import mongoose, { Schema } from "mongoose";
const answerSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
}, { timestamps: true });
const questionSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    answers: [answerSchema],
}, { timestamps: true });
questionSchema.index({ course: 1, lesson: 1, createdAt: -1 });
const reviewSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, trim: true },
}, { timestamps: true });
reviewSchema.index({ course: 1, user: 1 }, { unique: true });
const transcriptionSectionSchema = new Schema({
    title: { type: String, required: true, trim: true },
    progress: { type: String, default: "" },
    duration: { type: String, default: "" },
    content: { type: String, default: "" },
}, { _id: true });
const transcriptionSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    sections: [transcriptionSectionSchema],
}, { timestamps: true });
transcriptionSchema.index({ course: 1, lesson: 1 }, { unique: true });
const learningReminderSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true },
    frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Once"],
        default: "Daily",
    },
    time: { type: String, required: true },
    calendarProvider: {
        type: String,
        enum: ["google", "apple", "none"],
        default: "none",
    },
}, { timestamps: true });
learningReminderSchema.index({ course: 1, user: 1, createdAt: -1 });
export const CourseQuestion = mongoose.model("CourseQuestion", questionSchema);
export const CourseReview = mongoose.model("CourseReview", reviewSchema);
export const LessonTranscription = mongoose.model("LessonTranscription", transcriptionSchema);
export const LearningReminder = mongoose.model("LearningReminder", learningReminderSchema);
