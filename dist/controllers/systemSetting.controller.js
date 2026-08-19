import { AppError } from "../errors/AppError.js";
import { getAllSettings, getSettingsByCategory, updateSettingsByCategory, } from "../services/systemSetting.service.js";
export const getAll = async (req, res, next) => {
    try {
        const data = await getAllSettings();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const getByCategory = async (req, res, next) => {
    try {
        const category = req.params.category;
        const data = await getSettingsByCategory(category);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
export const updateByCategory = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const category = req.params.category;
        const data = await updateSettingsByCategory(category, userId, req.body);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
