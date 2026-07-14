import { AppError } from "../errors/AppError.js";
import roomModel from "../models/room.model.js";
import userModel from "../models/user.model.js";
import messageModel from "../models/message.model.js";
import {
  CreateGroupRoomRequest,
  CreateDMRequest,
  RoomResponse,
  RoomListItem,
  RoomParticipant,
} from "../types/room.types.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";

const getProfilePayload = (user: any) =>
  user?.profile ? { url: user.profile.url, publicId: user.profile.publicId } : null;

const toRoomResponse = (room: any): RoomResponse => ({
  id: room._id.toString(),
  name: room.name,
  description: room.description,
  isGroup: room.isGroup,
  profile: room.profile
    ? { url: room.profile.url, publicId: room.profile.publicId }
    : undefined,
  roomCreator: room.roomCreator.toString(),
  participants: (room.participants as any[]).map(
    (p): RoomParticipant => ({
      id: p._id.toString(),
      name: p.name,
      profile: getProfilePayload(p),
    }),
  ),
  createdAt: room.createdAt.toISOString(),
  updatedAt: room.updatedAt.toISOString(),
});

export const createGroupRoom = async (
  data: CreateGroupRoomRequest,
): Promise<RoomResponse> => {
  validateRequestBodyWithValues<CreateGroupRoomRequest>(data, [
    "userId",
    "name",
    "participantIds",
  ]);
  const { name, userId, description, profile, participantIds } = data;

  if (!participantIds || participantIds.length === 0) {
    throw new AppError("At least one participant is required", 400);
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 400);
  }

  const uniqueParticipants = Array.from(
    new Set([userId, ...participantIds]),
  );

  const foundUsers = await userModel.find({ _id: { $in: uniqueParticipants } });
  if (foundUsers.length !== uniqueParticipants.length) {
    throw new AppError("One or more participants do not exist", 400);
  }

  let uploadedProfile;
  if (profile) {
    uploadedProfile = await uploadMedia(profile.buffer, "image");
  }

  const room = await roomModel.create({
    roomCreator: userId,
    isGroup: true,
    participants: uniqueParticipants,
    name,
    description,
    profile: uploadedProfile
      ? { url: uploadedProfile.secure_url, publicId: uploadedProfile.public_id }
      : undefined,
  });

  const populatedRoom = await roomModel
    .findById(room._id)
    .populate("participants", "name profile");

  if (!populatedRoom) {
    throw new AppError("Failed to create room", 400);
  }

  return toRoomResponse(populatedRoom);
};

export const findOrCreateDM = async (
  data: CreateDMRequest,
): Promise<RoomResponse> => {
  validateRequestBodyWithValues<CreateDMRequest>(data, [
    "userId",
    "otherUserId",
  ]);
  const { userId, otherUserId } = data;

  if (userId === otherUserId) {
    throw new AppError("You cannot start a conversation with yourself", 400);
  }

  const otherUser = await userModel.findById(otherUserId);
  if (!otherUser) {
    throw new AppError("user not found", 400);
  }

  let room = await roomModel
    .findOne({
      isGroup: false,
      participants: { $all: [userId, otherUserId], $size: 2 },
    })
    .populate("participants", "name profile");

  if (!room) {
    const created = await roomModel.create({
      roomCreator: userId,
      isGroup: false,
      participants: [userId, otherUserId],
    });
    room = await roomModel
      .findById(created._id)
      .populate("participants", "name profile");
  }

  if (!room) {
    throw new AppError("Failed to create conversation", 400);
  }

  return toRoomResponse(room);
};

export const listMyRooms = async (userId: string): Promise<RoomListItem[]> => {
  const rooms = await roomModel
    .find({ participants: userId })
    .populate("participants", "name profile")
    .sort({ updatedAt: -1 });

  const roomsWithLastMessage = await Promise.all(
    rooms.map(async (room) => {
      const lastMessage = await messageModel
        .findOne({ roomId: room._id })
        .sort({ createdAt: -1 });

      return {
        ...toRoomResponse(room),
        lastMessage: lastMessage
          ? {
              text: lastMessage.text || undefined,
              senderId: lastMessage.senderId.toString(),
              hasMedia: !!lastMessage.media,
              hasFile: !!lastMessage.file,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
      };
    }),
  );

  return roomsWithLastMessage;
};

export const isRoomParticipant = async (
  roomId: string,
  userId: string,
): Promise<boolean> => {
  const room = await roomModel.findOne({ _id: roomId, participants: userId });
  return !!room;
};
