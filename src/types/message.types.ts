export interface mediaData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface MessageRequestData {
  senderId: string;
  roomId: string;
  text?: string;
  replyTo?: string;
  media?: mediaData;
  file?: mediaData;
}

export interface MessageSender {
  id: string;
  name: string;
  profile?: {
    url: string;
    publicId: string;
  } | null;
}

export interface MessageResponseData {
  id: string;
  senderId: MessageSender;
  roomId: string;
  text: string;
  replyTo?: {
    id: string;
    text: string;
    senderId: MessageSender;
  } | null;
  media?: {
    url: string;
    publicId: string;
  };
  file?: {
    url: string;
    publicId: string;
  };
  reactions: {
    emoji: string;
    users: MessageSender[];
    count: number;
  }[];
  createdAt: string;
}

export interface GetMessagesRoom {
  roomId: string;
  requesterId: string;
  query: any;
}

export interface GetMessagesResponse {
  messages: MessageResponseData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
