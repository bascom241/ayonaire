import { createWorkShop, editWorkShop, getAllWorkShops, } from "../services/workShop.service.js";
export const create = async (req, res, next) => {
    try {
        const { title, description, platform, status, startDate, endDate } = req.body;
        const authRequest = req;
        const userId = authRequest.user?.id;
        const dataToSend = {
            title,
            description,
            platform,
            status,
            startDate,
            endDate,
        };
        const data = await createWorkShop(dataToSend, userId);
        res
            .status(200)
            .json({ success: true, data, message: "WorkShop Created successfully" });
    }
    catch (err) {
        next(err);
    }
};
export const get = async (req, res, next) => {
    try {
        const data = await getAllWorkShops(req.query);
        return res
            .status(200)
            .json({ success: true, data, message: "Workshops fetched successfully" });
    }
    catch (err) {
        next(err);
    }
};
export const edit = async (req, res, next) => {
    try {
        const { title, description, platform, status, startDate, endDate, } = req.body;
        const id = req.params;
        const authRequest = req;
        const userId = authRequest.user?.id;
        const dataToSend = {
            title,
            description,
            platform,
            status,
            startDate,
            endDate,
            workShopId: id,
        };
        const data = await editWorkShop(dataToSend, userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
