export interface RoomData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface CreateRoomRequest {
  userId: string;
  profile?: RoomData;
  name: string;
  description: string;
}

export interface CreateRoomResponse {
  userId: string;
  profile?: {
    url: string;
    publicId: string;
  };
  name: string;
  description: string;
}
