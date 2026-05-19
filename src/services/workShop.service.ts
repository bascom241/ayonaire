import feedModel from "../models/feed.model.js";
import workshopModel from "../models/workshop.model.js";
import {
  CreateWorkShopRequest,
  CreateWorkShopResponse,
  GetAllWorkShopsResponse,
} from "../types/workShop.types.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { getPagination } from "../utils/getPagination.js";

export const createWorkShop = async (
  data: CreateWorkShopRequest,
  userId: string |undefined
): Promise<CreateWorkShopResponse> => {
  validateRequestBodyWithValues<CreateWorkShopRequest>(data, [
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
  });

  await feedModel.create({
    userId,
    type: "workshop",
    referenceId: workshop._id,
    referenceModel: "WorkShop",
    content: `New Workshop: ${workshop.title}`,
  });

  return {
    id: workshop._id.toString(),
    title: workshop.title,
    description: workshop.description,
    platform: {
      type: workshop.platform.type,
      name: workshop.platform.name,
      link: workshop.platform.link,
    },

    startDate: workshop.startDate.toISOString(),
    endDate: workshop.endDate.toISOString(),
    status: workshop.status,
  };
};


export const getAllWorkShops = async (data: any) : Promise<GetAllWorkShopsResponse> => {
  const {page, limit, skip} = getPagination(data)
  const [workshop, total] = await Promise.all([
    workshopModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    workshopModel.countDocuments()
  ])
  return {
    workshops: workshop.map((workshop) => ({
      id: workshop._id.toString(),
      title: workshop.title,
      description: workshop.description,
      platform: {
        type: workshop.platform?.type || "",
        name: workshop.platform?.name || "",
        link: workshop.platform?.link || "",
      },
      startDate: workshop.startDate.toISOString(),
      endDate: workshop.endDate.toISOString(),
      status: workshop.status,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
