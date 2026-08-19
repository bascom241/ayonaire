import { AppError } from "../errors/AppError.js";
import systemSettingModel from "../models/systemSetting.model.js";
import { SettingCategory } from "../types/systemSetting.types.js";
const ensureValidCategory = (category) => {
    if (!Object.values(SettingCategory).includes(category)) {
        throw new AppError(`category must be one of: ${Object.values(SettingCategory).join(", ")}`, 400);
    }
};
export const getAllSettings = async () => {
    const settings = await systemSettingModel.find();
    const result = {};
    Object.values(SettingCategory).forEach((category) => {
        const found = settings.find((s) => s.category === category);
        result[category] = found?.data || {};
    });
    return result;
};
export const getSettingsByCategory = async (category) => {
    ensureValidCategory(category);
    const setting = await systemSettingModel.findOne({ category });
    return setting?.data || {};
};
export const updateSettingsByCategory = async (category, userId, data) => {
    ensureValidCategory(category);
    const setting = await systemSettingModel.findOneAndUpdate({ category }, {
        $set: {
            updatedBy: userId,
            ...Object.fromEntries(Object.entries(data).map(([key, value]) => [`data.${key}`, value])),
        },
    }, { upsert: true, new: true });
    return setting.data;
};
