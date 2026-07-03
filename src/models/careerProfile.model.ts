import mongoose, { Schema } from "mongoose";
import { CareerProfile } from "../types/careerAccelerator.types.js";

const careerProfileSchema = new Schema<CareerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    headline: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    hourlyRate: String,
    availability: {
      type: String,
      default: "Available",
    },
    services: {
      type: [String],
      default: [],
    },
    expertiseAreas: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model<CareerProfile>("CareerProfile", careerProfileSchema);
