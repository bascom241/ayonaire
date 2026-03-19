import mongoose,{ Schema } from "mongoose";
import { CourseCategory, CourseCategoryEnum } from "../types/category.types.js";

const categorySchema = new Schema<CourseCategory> ({
    title: {
        type: String,
        enum: Object.values(CourseCategoryEnum)
    }
})

export default mongoose.model("CourseCategory", categorySchema);