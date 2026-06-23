import mongoose, { Schema } from "mongoose";
const annoucementSchema = new Schema({
    // cohort: {
    //     type:Schema.Types.ObjectId,
    //     ref:"Cohort",
    // },
    audience: {
        type: String,
        required: [true, "audience is required"],
    },
    // course: {
    //     type:Schema.Types.ObjectId,
    //     ref: "Course",
    // },
    // users: {
    //     type:[Schema.Types.ObjectId],
    //     ref:"User"
    // },
    title: {
        type: String,
        required: [true, "Announcement title is required"],
    },
    summary: {
        type: String,
        required: [true, "summary is required"],
    },
});
export default mongoose.model("Announcement", annoucementSchema);
