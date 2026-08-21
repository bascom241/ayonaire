import mongoose, { Schema } from "mongoose";

const lessonSchema = new Schema(
  {
    title: { type: String, required: true },

    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    order: { type: Number, required: true },

    duration: Number,

    isPublished: { type: Boolean, default: false },

    isFreePreview: { type: Boolean, default: false },

    isLocked: { type: Boolean, default: true },

    videos: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        publicId: String,
        duration: { type: Number, default: 0 },
        sourceType: {
          type: String,
          enum: ["upload", "url"],
          default: "upload",
        },
        provider: {
          type: String,
          enum: [
            "cloudinary",
            "youtube",
            "vimeo",
            "mux",
            "bunny",
            "cloudflare",
            "external",
          ],
          default: "cloudinary",
        },
      },
    ],

    materials: [
      {
        name: String,
        url: String,
        publicId: String,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Lesson", lessonSchema);
