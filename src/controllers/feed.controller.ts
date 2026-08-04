import {
  editFeed,
  createFeed,
  viewFeeds,
  deleteFeed,
  likePost,
  commentOnAPost,
  deleteComment,
  createTags,
  sharePost,
  reportPost,
  getCommunityStats,
} from "../services/feed.service.js";
import { Response, Request, NextFunction } from "express";
import {
  CommentFeedRequest,
  CreateFeedRequest,
  CreateTagRequest,
  DeleteCommentRequest,
  DeleteFeedRequest,
  EditFeedRequest,
  LikeFeedRequest,
  ShareFeedRequest,
  ReportFeedRequest,
} from "../types/feed.types.js";
import mongoose from "mongoose";

export interface AuthRequest<T = any> extends Request {
  body: T;
  user?: { id: string; email?: string };
}

export const uploadTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { titles } = req.body;
    const dataToSend: CreateTagRequest = {
      titles,
    };
    const data = await createTags(dataToSend);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content, tag } = req.body;
    const userId = req.user?.id;
    const dataToSend: CreateFeedRequest = {
      content,
      tag,
      media: req.file,
    };
    const data = await createFeed(dataToSend, userId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const edit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { content, feedId, tag } = req.body;
    const userId = req.user?.id;
    const dataToSend: EditFeedRequest = {
      tag,
      feedId,
      content,
      media: req.file,
    };

    const data = await editFeed(dataToSend, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteF = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { feedId } = req.body;
    const userId = req.user?.id;

    const dataToSend: DeleteFeedRequest = {
      feedId,
    };

    const data = await deleteFeed(dataToSend, userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const view = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, page, limit } = req.query;
    const data = await viewFeeds({
      tag: tag as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const likeFeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { feedId } = req.body;
    const userId = req.user?.id;
    const dataToSend: LikeFeedRequest = {
      feedId,
    };
    const data = await likePost(dataToSend, userId);
    res.status(200).json({ success: true, message: "Feed liked", data });
  } catch (error) {
    next(error);
  }
};

export const commentOnAfeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { feedId, text } = req.body;
    const dataToSend: CommentFeedRequest = {
      feedId,
      text,
    };

    const data = await commentOnAPost(dataToSend, userId);
    res
      .status(200)
      .json({ success: true, data, message: "commented successfully " });
  } catch (error) {
    next(error);
  }
};

export const deleteC = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { feedId, commentId } = req.body;
    const dataToSend: DeleteCommentRequest = {
      feedId,
      commentId,
    };
    const data = await deleteComment(dataToSend, userId);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};

export const shareFeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { feedId } = req.body;
    const userId = req.user?.id;
    const dataToSend: ShareFeedRequest = {
      feedId,
    };
    const data = await sharePost(dataToSend, userId);
    res.status(200).json({ success: true, message: "Feed shared", data });
  } catch (error) {
    next(error);
  }
};

export const communityStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getCommunityStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const reportFeed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { feedId, reason } = req.body;
    const userId = req.user?.id;
    const dataToSend: ReportFeedRequest = {
      feedId,
      reason,
    };
    const data = await reportPost(dataToSend, userId);
    res.status(200).json({ success: true, message: data });
  } catch (error) {
    next(error);
  }
};
