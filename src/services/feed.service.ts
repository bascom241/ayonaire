import feedModel from "../models/feed.model.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import {
  CreateFeedRequest,
  EditFeedRequest,
  DeleteFeedRequest,
  FeedResponse,
  LikeFeedRequest,
  CommentFeedRequest,
  DeleteCommentRequest,
  FeedTag,
  ShareFeedRequest,
  ShareFeedResponse,
  ReportFeedRequest,
  ViewFeedsQuery,
} from "../types/feed.types.js";
import userModel from "../models/user.model.js";
import announcementModel from "../models/announcement.model.js";
import { AppError } from "../errors/AppError.js";
import mongoose from "mongoose";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { deleteImage } from "../utils/uploadToCloudinary.js";
import {
  CreateTagRequest,
  CreateTagResponse,
  CommunityStatsResponse,
} from "../types/feed.types.js";
import feedTagModel from "../models/feedTag.model.js";
import { getPagination } from "../utils/getPagination.js";

const getUserProfilePayload = (user: any) =>
  user?.profile
    ? {
        url: user.profile.url,
        publicId: user.profile.publicId,
      }
    : null;

// Shared shape-builder so REST, and the feed socket layer that broadcasts
// full records to every connected client, never drift out of sync.
//
// userId/comments[].userId are populated refs, but the referenced User can
// be deleted after a post/comment was made - a single such orphaned record
// used to throw here and take down the *entire* feed list response (Array.map
// aborts on the first error), so every field pulled off a populated ref is
// guarded instead of assumed present.
const toFeedResponse = (feed: any): FeedResponse => ({
  id: feed._id.toString(),
  content: feed.content,
  media: feed.media
    ? {
        url: feed.media.url,
        publicId: feed.media.publicId,
      }
    : undefined,
  tag: (feed.tag as any)?.titles,
  user: {
    id: feed.userId?._id?.toString() ?? "",
    name: (feed.userId as any)?.name ?? "Deleted user",
    profile: getUserProfilePayload(feed.userId),
  },
  likes: feed.likes.map((id: any) => id.toString()),
  comments: feed.comments.map((c: any) => ({
    user: {
      id: c.userId?._id?.toString() ?? "",
      name: c.userId?.name ?? "Deleted user",
    },
    text: c.text,
    createdAt: c.createdAt.toISOString(),
  })),
  shares: feed.shares,
  createdAt: feed.createdAt.toISOString(),
});

export const getFeedById = async (
  feedId: string,
): Promise<FeedResponse | null> => {
  const feed = await feedModel
    .findById(feedId)
    .populate("userId", "name profile")
    .populate("comments.userId", "name")
    .populate("tag", "titles");
  return feed ? toFeedResponse(feed) : null;
};

export const createTags = async (
  data: CreateTagRequest,
): Promise<CreateTagResponse> => {
  const { titles } = data;
  if (titles.length === 0) {
    throw new AppError("titles can not be empty");
  }
  const allowedTags = Object.values(FeedTag) as FeedTag[];
  const isValid = titles.every((str) => allowedTags.includes(str as FeedTag));
  if (!isValid) {
    throw new AppError("title tag is a not allowed");
  }
  const newTags = await feedTagModel.create({
    titles,
  });
  return {
    id: newTags._id.toString(),
    titles: newTags.titles,
  };
};
export const createFeed = async (
  data: CreateFeedRequest,
  userId: string | undefined,
): Promise<FeedResponse> => {
  const { content, media, tag } = data;
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user does not exits", 400);
  }
  validateRequestBodyWithValues<CreateFeedRequest>(data, ["content"]);

  const normalizedContent = content.trim().toLowerCase();
  const postContent = content.trim();

  const recentPost = await feedModel.findOne({
    userId,
    content: normalizedContent,
    createdAt: {
      $gte: new Date(Date.now() - 60 * 1000),
    },
  });

  if (recentPost) {
    throw new AppError("You just Made this post");
  }

  let uploadResult;
  if (data.media) {
    try {
      uploadResult = await uploadMedia(data.media.buffer, "image");
    } catch (err) {
      console.log(err);
      throw new AppError("Failed to upload file to cloudinary", 400);
    }
  }

  const feedData: any = {
    userId: new mongoose.Types.ObjectId(userId),
    content: postContent,
  };

  if (tag) {
    feedData.tag = new mongoose.Types.ObjectId(tag);
  }

  if (uploadResult) {
    feedData.media = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  const createdFeed = await feedModel.create(feedData);
  const newData = await getFeedById(createdFeed._id.toString());
  if (!newData) {
    throw new AppError("Failed to retrieve created feed", 500);
  }
  return newData;
};

export const editFeed = async (
  data: EditFeedRequest,
  userId: string | undefined,
): Promise<FeedResponse> => {
  validateRequestBodyWithValues<EditFeedRequest>(data, ["feedId"]);

  const { feedId, content, media, tag } = data;

  const convertedUserId = new mongoose.Types.ObjectId(userId);

  const feedToEdit = await feedModel.findOne({
    _id: feedId,
    userId: convertedUserId,
  });

  if (!feedToEdit) {
    throw new AppError("feed not found / not yours", 400);
  }

  if (media) {
    if (feedToEdit.media?.publicId) {
      await deleteImage(feedToEdit.media.publicId);
    }

    const uploadedResult = await uploadMedia(media.buffer, "image");
    feedToEdit.media = {
      url: uploadedResult.secure_url,
      publicId: uploadedResult.public_id,
    };
  }

  if (content !== undefined) feedToEdit.content = content;
  if (tag !== undefined) feedToEdit.tag = new mongoose.Types.ObjectId(tag);

  const updatedFeed = await feedToEdit.save();
  const newEditedFeed = await getFeedById(updatedFeed._id.toString());
  if (!newEditedFeed) {
    throw new AppError("Failed to retrieve created feed", 500);
  }
  return newEditedFeed;
};

export const deleteFeed = async (
  data: DeleteFeedRequest,
  userId: string | undefined,
): Promise<string> => {
  validateRequestBodyWithValues<DeleteFeedRequest>(data, ["feedId"]);
  const { feedId } = data;
  const feedToDelete = await feedModel.findOne({ _id: feedId, userId: userId });
  if (!feedToDelete) {
    throw new AppError("feed not found", 400);
  }
  if (feedToDelete.media?.publicId) {
    await deleteImage(feedToDelete.media.publicId);
  }
  await feedModel.findByIdAndDelete(feedId);
  return "Feed Deleted successfully";
};

export const viewFeeds = async (
  query: ViewFeedsQuery = {},
): Promise<FeedResponse[]> => {
  const { tag } = query;
  const { limit, skip } = getPagination({
    page: query.page,
    limit: query.limit || 20,
  });

  const filter: Record<string, any> = {};
  if (tag) {
    const matchingTags = await feedTagModel.find({ titles: tag }, "_id");
    filter.tag = { $in: matchingTags.map((t) => t._id) };
  }

  const feeds = await feedModel
    .find(filter)
    .populate("userId", "name profile")
    .populate("comments.userId", "name")
    .populate("tag", "titles")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return feeds.map(toFeedResponse);
};

export const likePost = async (
  data: LikeFeedRequest,
  userId: string | undefined,
): Promise<FeedResponse> => {
  validateRequestBodyWithValues<LikeFeedRequest>(data, ["feedId"]);

  const { feedId } = data;
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found");
  }

  const convertedUserId = new mongoose.Types.ObjectId(userId);

  const feedToLike = await feedModel.findById(feedId);
  if (!feedToLike) {
    throw new AppError("Feed does not exists");
  }
  const hasLiked = feedToLike.likes.includes(convertedUserId);

  if (hasLiked) {
    await feedModel.updateOne(
      { _id: feedId },
      { $pull: { likes: convertedUserId }, $inc: { likesCount: -1 } },
    );
  } else {
    await feedModel.updateOne(
      { _id: feedId },
      { $addToSet: { likes: convertedUserId }, $inc: { likesCount: 1 } },
    );
  }

  const updatedFeed = await getFeedById(feedToLike._id.toString());
  if (!updatedFeed) {
    throw new AppError("Feed does not exists");
  }
  return updatedFeed;
};

export const commentOnAPost = async (
  data: CommentFeedRequest,
  userId: string | undefined,
): Promise<FeedResponse> => {
  validateRequestBodyWithValues<CommentFeedRequest>(data, ["feedId"]);
  const { feedId, text } = data;
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found");
  }

  const convertedUserId = new mongoose.Types.ObjectId(userId);

  const feedToComment = await feedModel
    .findById(feedId)
    .populate("userId", "name profile")
    .populate("comments.userId", "name");
  if (!feedToComment) {
    throw new AppError("Feed does not exists");
  }

  feedToComment.comments.push({
    userId: convertedUserId,
    text,
    createdAt: new Date(),
  } as any);
  feedToComment.commentCounts += 1;
  const feed = await feedToComment.save();
  await feed.populate("comments.userId", "name");
  await feed.populate("tag", "titles");

  return toFeedResponse(feed);
};

export const deleteComment = async (
  data: DeleteCommentRequest,
  userId: string | undefined,
): Promise<string> => {
  validateRequestBodyWithValues<DeleteCommentRequest>(data, [
    "feedId",
    "commentId",
  ]);

  const { feedId, commentId } = data;

  const convertedUserId = new mongoose.Types.ObjectId(userId);
  const user = await userModel.findById(convertedUserId);
  if (!user) {
    throw new AppError("user not found", 400);
  }

  const feedToDeleteItsComment = await feedModel.findOne({
    _id: feedId,
    "comments._id": commentId,
    "comments.userId": convertedUserId,
  });

  if (!feedToDeleteItsComment) {
    throw new AppError("feed not found", 400);
  }

  await feedModel.updateOne(
    { _id: feedId },
    { $pull: { comments: { _id: commentId } }, $inc: { commentCounts: -1 } },
  );

  return "Comment Deleted successfully";
};

export const sharePost = async (
  data: ShareFeedRequest,
  userId: string | undefined,
): Promise<ShareFeedResponse> => {
  validateRequestBodyWithValues<ShareFeedRequest>(data, ["feedId"]);
  const { feedId } = data;

  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 400);
  }

  const sharedFeed = await feedModel.findByIdAndUpdate(
    feedId,
    { $inc: { shares: 1 } },
    { new: true },
  );

  if (!sharedFeed) {
    throw new AppError("Feed does not exists", 400);
  }

  return {
    feedId: sharedFeed._id.toString(),
    shares: sharedFeed.shares,
  };
};

export const getCommunityStats = async (): Promise<CommunityStatsResponse> => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalMembers, totalPosts, totalAnnouncements, postsToday] =
    await Promise.all([
      userModel.countDocuments({ role: { $ne: "admin" } }),
      feedModel.countDocuments({}),
      announcementModel.countDocuments({}),
      feedModel.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

  return { totalMembers, totalPosts, totalAnnouncements, postsToday };
};

export const reportPost = async (
  data: ReportFeedRequest,
  userId: string | undefined,
): Promise<string> => {
  validateRequestBodyWithValues<ReportFeedRequest>(data, [
    "feedId",
    "reason",
  ]);
  const { feedId, reason } = data;

  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user not found", 400);
  }

  const convertedUserId = new mongoose.Types.ObjectId(userId);

  const feedToReport = await feedModel.findById(feedId);
  if (!feedToReport) {
    throw new AppError("Feed does not exists", 400);
  }

  const alreadyReported = feedToReport.reports.some((report: any) =>
    report.userId?.equals(convertedUserId),
  );
  if (alreadyReported) {
    throw new AppError("You have already reported this post", 400);
  }

  await feedModel.updateOne(
    { _id: feedId },
    { $push: { reports: { userId: convertedUserId, reason } } },
  );

  return "Post reported successfully";
};
