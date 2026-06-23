export interface mediaData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface MessageRequestData {
  senderId: string;
  roomId: string;
  text?: string;
  media?: mediaData;
  file?: mediaData;
}

export interface MessageResponseData {
  senderId: {
    id: string;
    name: string;
  };
  roomId: string;
  text: string;
  media?: {
    url: string;
    publicId: string;
  };
  file?: {
    url: string;
    publicId: string;
  };
}

export interface GetMessagesRoom {
  roomId: string;
  query: any;
}

export interface GetMessagesResponse {
  messages: {
    senderId: {
      id: string;
      name: string;
    };
    roomId: string;
    text: string;
    media?: {
      url: string;
      publicId: string;
    };
    file?: {
      url: string;
      publicId: string;
    };
  }[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
