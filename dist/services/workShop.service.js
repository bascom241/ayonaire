import feedModel from "../models/feed.model.js";
import workshopModel from "../models/workshop.model.js";
import { WorkShopStatus, } from "../types/workShop.types.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { getPagination } from "../utils/getPagination.js";
import { AppError } from "../errors/AppError.js";
const computeWorkshopStatus = (startDate, endDate) => {
    const now = new Date();
    if (now < startDate)
        return WorkShopStatus.UPCOMING;
    if (now > endDate)
        return WorkShopStatus.COMPLETED;
    return WorkShopStatus.LIVE;
};
const toCreateWorkShopResponse = (workshop) => {
    const createdBy = workshop.createdBy && typeof workshop.createdBy === "object"
        ? {
            id: workshop.createdBy._id.toString(),
            name: workshop.createdBy.name,
        }
        : null;
    return {
        id: workshop._id.toString(),
        title: workshop.title,
        description: workshop.description,
        platform: {
            type: workshop.platform?.type || "",
            name: workshop.platform?.name || "",
            link: workshop.platform?.link || "",
        },
        createdBy,
        startDate: workshop.startDate.toISOString(),
        endDate: workshop.endDate.toISOString(),
        status: computeWorkshopStatus(workshop.startDate, workshop.endDate),
        createdAt: workshop.createdAt.toISOString(),
        updatedAt: workshop.updatedAt.toISOString(),
    };
};
export const createWorkShop = async (data, userId) => {
    validateRequestBodyWithValues(data, [
        "title",
        "description",
        "platform",
        "startDate",
        "endDate",
    ]);
    const { title, description, platform, startDate, endDate } = data;
    const workshop = await workshopModel.create({
        title,
        description,
        platform,
        startDate,
        endDate,
        createdBy: userId,
    });
    await feedModel.create({
        userId,
        type: "workshop",
        referenceId: workshop._id,
        referenceModel: "WorkShop",
        content: `New Workshop: ${workshop.title}`,
    });
    const populatedWorkshop = await workshopModel
        .findById(workshop._id)
        .populate("createdBy", "name");
    return toCreateWorkShopResponse(populatedWorkshop);
};
export const getAllWorkShops = async (data) => {
    const { page, limit, skip } = getPagination(data);
    const [workshop, total] = await Promise.all([
        workshopModel
            .find()
            .populate("createdBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        workshopModel.countDocuments(),
    ]);
    return {
        workshops: workshop.map(toCreateWorkShopResponse),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getWorkShopById = async (workShopId) => {
    const workshop = await workshopModel
        .findById(workShopId)
        .populate("createdBy", "name");
    if (!workshop) {
        throw new AppError("workshop not found", 404);
    }
    return toCreateWorkShopResponse(workshop);
};
export const editWorkShop = async (data, userId) => {
    validateRequestBodyWithValues(data, ["workShopId"]);
    const { workShopId, title, description, platform, startDate, endDate } = data;
    const workshop = await workshopModel.findById(workShopId);
    if (!workshop) {
        throw new AppError("workshop not found", 404);
    }
    if (title !== undefined) {
        workshop.title = title;
        await feedModel.findOneAndUpdate({ referenceId: workShopId, referenceModel: "WorkShop" }, { content: `New Workshop: ${title}` });
    }
    if (description !== undefined)
        workshop.description = description;
    if (platform) {
        const { name, link, type } = platform;
        if (name !== undefined)
            workshop.platform.name = name;
        if (link !== undefined)
            workshop.platform.link = link;
        if (type !== undefined)
            workshop.platform.type = type;
    }
    if (startDate !== undefined)
        workshop.startDate = new Date(startDate);
    if (endDate !== undefined)
        workshop.endDate = new Date(endDate);
    await workshop.save();
    const populatedWorkshop = await workshopModel
        .findById(workshop._id)
        .populate("createdBy", "name");
    return toCreateWorkShopResponse(populatedWorkshop);
};
export const deleteWorkShop = async (data) => {
    validateRequestBodyWithValues(data, ["workShopId"]);
    const { workShopId } = data;
    const workshop = await workshopModel.findById(workShopId);
    if (!workshop) {
        throw new AppError("workshop not found", 404);
    }
    await workshopModel.findByIdAndDelete(workShopId);
    await feedModel.deleteMany({
        referenceId: workShopId,
        referenceModel: "WorkShop",
    });
    return "Workshop deleted successfully";
};
