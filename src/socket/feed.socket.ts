import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import { authenticateSocket } from "./authenticateSocket.js";
import {
  createFeed,
  editFeed,
  deleteFeed,
  viewFeeds,
  likePost,
  commentOnAPost,
  deleteComment,
  sharePost,
  reportPost,
  getFeedById,
} from "../services/feed.service.js";
import {
  CreateFeedRequest,
  EditFeedRequest,
  DeleteFeedRequest,
  LikeFeedRequest,
  CommentFeedRequest,
  DeleteCommentRequest,
  ShareFeedRequest,
  ReportFeedRequest,
  ViewFeedsQuery,
  MediaData,
} from "../types/feed.types.js";

type Ack<T = any> = (response: {
  success: boolean;
  data?: T;
  message?: string;
}) => void;

interface IncomingMedia {
  buffer: ArrayBuffer | Buffer;
  mimetype: string;
  originalname: string;
}

interface CreateFeedPayload {
  content: string;
  tag?: string;
  channel?: string;
  media?: IncomingMedia;
}

interface EditFeedPayload extends CreateFeedPayload {
  feedId: string;
}

interface DeleteFeedPayload {
  feedId: string;
}

interface LikeFeedPayload {
  feedId: string;
}

interface CommentFeedPayload {
  feedId: string;
  text: string;
}

interface DeleteCommentPayload {
  feedId: string;
  commentId: string;
}

interface ShareFeedPayload {
  feedId: string;
}

interface ReportFeedPayload {
  feedId: string;
  reason: string;
}

interface ViewFeedsPayload {
  tag?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

const normalizeMedia = (media?: IncomingMedia | null): MediaData | undefined => {
  if (!media) return undefined;
  const buffer = Buffer.isBuffer(media.buffer)
    ? media.buffer
    : Buffer.from(media.buffer);
  return {
    buffer,
    mimetype: media.mimetype,
    originalname: media.originalname,
  };
};

// A single failure inside a handler must never crash the process or hang
// the caller - every branch always resolves the ack exactly once.
const safeAck = (ack: unknown): Ack => {
  if (typeof ack === "function") return ack as Ack;
  return () => {};
};

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Something went wrong";

const feedSocket = (io: Server) => {
  const feedNamespace = io.of("/feed");

  feedNamespace.use(authenticateSocket);

  feedNamespace.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.id as string | undefined;

    socket.on(
      "feed:create",
      async (payload: CreateFeedPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: CreateFeedRequest = {
            content: payload?.content,
            tag: payload?.tag,
            channel: payload?.channel,
            media: normalizeMedia(payload?.media),
          };
          const data = await createFeed(dataToSend, userId);
          respond({ success: true, data });
          feedNamespace.emit("feed:created", data);
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );

    socket.on("feed:edit", async (payload: EditFeedPayload, ack?: unknown) => {
      const respond = safeAck(ack);
      try {
        const dataToSend: EditFeedRequest = {
          feedId: payload?.feedId,
          content: payload?.content,
          tag: payload?.tag as string,
          channel: payload?.channel,
          media: normalizeMedia(payload?.media),
        };
        const data = await editFeed(dataToSend, userId);
        respond({ success: true, data });
        feedNamespace.emit("feed:updated", data);
      } catch (err) {
        respond({ success: false, message: errorMessage(err) });
      }
    });

    socket.on(
      "feed:delete",
      async (payload: DeleteFeedPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: DeleteFeedRequest = { feedId: payload?.feedId };
          const message = await deleteFeed(dataToSend, userId);
          respond({ success: true, message });
          feedNamespace.emit("feed:deleted", { feedId: payload?.feedId });
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );

    socket.on("feed:list", async (payload: ViewFeedsPayload, ack?: unknown) => {
      const respond = safeAck(ack);
      try {
        const query: ViewFeedsQuery = {
          tag: payload?.tag,
          channel: payload?.channel,
          page: payload?.page,
          limit: payload?.limit,
        };
        const data = await viewFeeds(query);
        respond({ success: true, data });
      } catch (err) {
        respond({ success: false, message: errorMessage(err) });
      }
    });

    socket.on("feed:like", async (payload: LikeFeedPayload, ack?: unknown) => {
      const respond = safeAck(ack);
      try {
        const dataToSend: LikeFeedRequest = { feedId: payload?.feedId };
        const data = await likePost(dataToSend, userId);
        respond({ success: true, data });
        feedNamespace.emit("feed:updated", data);
      } catch (err) {
        respond({ success: false, message: errorMessage(err) });
      }
    });

    socket.on(
      "feed:comment",
      async (payload: CommentFeedPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: CommentFeedRequest = {
            feedId: payload?.feedId,
            text: payload?.text,
          };
          const data = await commentOnAPost(dataToSend, userId);
          respond({ success: true, data });
          feedNamespace.emit("feed:updated", data);
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );

    socket.on(
      "feed:comment:delete",
      async (payload: DeleteCommentPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: DeleteCommentRequest = {
            feedId: new mongoose.Types.ObjectId(payload?.feedId),
            commentId: new mongoose.Types.ObjectId(payload?.commentId),
          };
          const message = await deleteComment(dataToSend, userId);
          respond({ success: true, message });

          const updatedFeed = await getFeedById(payload?.feedId);
          if (updatedFeed) {
            feedNamespace.emit("feed:updated", updatedFeed);
          }
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );

    socket.on(
      "feed:share",
      async (payload: ShareFeedPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: ShareFeedRequest = { feedId: payload?.feedId };
          const data = await sharePost(dataToSend, userId);
          respond({ success: true, data });
          feedNamespace.emit("feed:shared", data);
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );

    socket.on(
      "feed:report",
      async (payload: ReportFeedPayload, ack?: unknown) => {
        const respond = safeAck(ack);
        try {
          const dataToSend: ReportFeedRequest = {
            feedId: payload?.feedId,
            reason: payload?.reason,
          };
          const message = await reportPost(dataToSend, userId);
          respond({ success: true, message });
        } catch (err) {
          respond({ success: false, message: errorMessage(err) });
        }
      },
    );
  });

  return feedNamespace;
};

export default feedSocket;
