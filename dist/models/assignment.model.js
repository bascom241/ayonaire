import mongoose, { Schema } from "mongoose";
const assignmentSchema = new Schema({
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
        required: [true, "Instructor Id is required"],
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course Id is Required to create an assignment"],
    },
    title: {
        type: String,
        required: [true, "Assignment Title is required"],
    },
    description: {
        type: String,
        required: [true, "Assignment Description is required"],
    },
    materials: [
        {
            title: String,
            url: String,
            publicId: String,
        },
    ],
    module: {
        type: Schema.Types.ObjectId,
        ref: "Module",
        required: [true, "Module is is required "]
    }
}, { timestamps: true });
export default mongoose.model("Assignments", assignmentSchema);
