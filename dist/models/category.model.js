import mongoose, { Schema } from "mongoose";
import { CourseCategoryEnum } from "../types/category.types.js";
const categorySchema = new Schema({
    title: {
        type: String,
        enum: Object.values(CourseCategoryEnum)
    }
});
export default mongoose.model("CourseCategory", categorySchema);
