
import { AppError } from "../errors/AppError.js";
import roomModel from "../models/room.model.js";
import userModel from "../models/user.model.js";
import { CreateRoomRequest, CreateRoomResponse } from "../types/room.types.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";

export const createRoom = async (data: CreateRoomRequest):Promise<CreateRoomResponse>=> {
  validateRequestBodyWithValues<CreateRoomRequest>(data, [
    "userId",
    "name",
    "description",
  ]);
  const { name, userId, description, profile } = data;

  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 400);
  }

  let uploadedProfile;
  if (profile) {
    uploadedProfile = await uploadMedia(profile.buffer, "image");
  }

  const room = await roomModel.create({
    roomCreator: userId,
    name,
    description,
    profile: {
      url: uploadedProfile.secure_url,
      publicId: uploadedProfile.public_id,
    },
  });


  if(!room){
    throw new AppError("Failed to create room", 400)
  }


  return {
    userId: room.roomCreator.toString(),
    name: room.name,
    description: room.description,
    profile: room.profile ? {
        url: room.profile.url,
        publicId: room.profile.publicId
    }: undefined
  }
};
