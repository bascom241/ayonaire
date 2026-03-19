import { createModule } from "../services/module.service.js";
import { AppError } from "../errors/AppError.js";
export const create = async (req, res, next) => {
    try {
        const { courseId, title, description, order } = req.body;
        if (!courseId || !title || !description || !order) {
            throw new AppError("courseId title description are required", 400);
        }
        const dataToSend = {
            courseId: req.body.courseId,
            title: req.body.title,
            description: req.body.description,
            order: req.body.order,
        };
        const data = await createModule(dataToSend);
        res
            .status(201)
            .json({ success: true, data, message: "module created successfully" });
    }
    catch (error) {
        next(error);
    }
};
