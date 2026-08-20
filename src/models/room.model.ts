import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    roomCreator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "creator id is required"],
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    profile: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true },
);

roomSchema.index({ participants: 1 });
roomSchema.index({ course: 1 }, { unique: true, sparse: true });

export default mongoose.model("Room", roomSchema);
