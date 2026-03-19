import mongoose from "mongoose";
import moduleModel from "../models/module.model.js";
import courseModel from "../models/course.model.js";
export const createModule = async (data) => {
    const moduleData = {
        title: data.title,
        description: data.description,
        course: new mongoose.Types.ObjectId(data.courseId),
        order: data.order,
    };
    const module = await moduleModel.create(moduleData);
    await courseModel.findByIdAndUpdate(moduleData.course, {
        $push: { modules: module._id },
    });
    return {
        _id: module._id.toString(),
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: module.lessons.map((id) => id.toString()),
    };
};
