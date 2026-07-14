export interface RoomData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface CreateGroupRoomRequest {
  userId: string;
  participantIds: string[];
  name: string;
  description?: string;
  profile?: RoomData;
}

export interface CreateDMRequest {
  userId: string;
  otherUserId: string;
}

export interface RoomParticipant {
  id: string;
  name: string;
  profile?: {
    url: string;
    publicId: string;
  } | null;
}

export interface RoomLastMessage {
  text?: string;
  senderId: string;
  hasMedia: boolean;
  hasFile: boolean;
  createdAt: string;
}

export interface RoomResponse {
  id: string;
  name?: string;
  description?: string;
  isGroup: boolean;
  profile?: {
    url: string;
    publicId: string;
  };
  roomCreator: string;
  participants: RoomParticipant[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomListItem extends RoomResponse {
  lastMessage: RoomLastMessage | null;
}
