import feedModel from "../models/feed.model.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import {
  CreateFeedRequest,
  CreateFeedResponse,
  EditFeedRequest,
  DeleteFeedRequest,
  FeedResponse,
  LikeFeedRequest,
  CommentFeedRequest,
  DeleteCommentRequest,
  FeedTag,
} from "../types/feed.types.js";
import userModel from "../models/user.model.js";
import { AppError } from "../errors/AppError.js";
import mongoose from "mongoose";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
import { deleteImage } from "../utils/uploadToCloudinary.js";
import { CreateTagRequest , CreateTagResponse} from "../types/feed.types.js";
import feedTagModel from "../models/feedTag.model.js";

export const createTags = async (data: CreateTagRequest):Promise<CreateTagResponse> => {
  const { titles } = data;
  if (titles.length === 0) {
    throw new AppError("titles can not be empty");
  }
  const allowedTags = Object.values(FeedTag) as FeedTag[];
  const isValid = titles.every(str => allowedTags.includes(str as FeedTag));
  if(!isValid){
    throw new AppError("title tag is a not allowed")
  };
  const newTags = await feedTagModel.create({
    titles
  });
  return {
    id: newTags._id.toString(),
    titles: newTags.titles
  }

};
export const createFeed = async (
  data: CreateFeedRequest,
  userId: string | undefined,
): Promise<CreateFeedResponse> => {
  const { content, media, tag  } = data;
  console.log(data.media);
  const user = await userModel.findById(userId);
  if (!user) {
    throw new AppError("user does not exits", 400);
  }

  const normalizedContent = content.trim().toLowerCase();

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
    tag: new mongoose.Types.ObjectId(tag),
    content: normalizedContent,
    media: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    },
  };

  const createdFeed = await feedModel.create(feedData);
  const newData = await feedModel.findById(createdFeed._id).populate("tag", "titles");
  if (!newData) {
    throw new AppError("Failed to retrieve created feed", 500);
  }
  return {
    tag:(newData.tag as any )?.titles,
    content: newData.content,
    media: newData.media
      ? {
          url: newData.media.url,
          publicId: newData.media.publicId,
        }
      : undefined,
  };
};

export const editFeed = async (
  data: EditFeedRequest,
  userId: string | undefined,
) => {
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
  if(tag !== undefined ) feedToEdit.tag = new mongoose.Types.ObjectId(tag);

  const updatedFeed = await feedToEdit.save();
 const newEditedFeed = await feedModel.findById(updatedFeed._id).populate("tag", "titles");
  if (!newEditedFeed) {
    throw new AppError("Failed to retrieve created feed", 500);
  }
  return {
    tag:(newEditedFeed.tag as any )?.titles,
    content: updatedFeed.content,
    media: updatedFeed.media
      ? {
          url: updatedFeed.media.url,
          publicId: updatedFeed.media.publicId,
        }
      : undefined,
  };
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

export const viewFeeds = async (): Promise<FeedResponse[]> => {
  const feeds = await feedModel
    .find()
    .populate("userId", "name")
    .populate("comments.userId", "name")
    .sort({ createdAt: -1 })
    .limit(20);
  return feeds.map((feed) => ({
    id: feed._id.toString(),
    content: feed.content,
    media: feed.media
      ? {
          url: feed.media.url,
          publicId: feed.media.publicId,
        }
      : undefined,
    user: {
      id: feed.userId._id.toString(),
      name: (feed.userId as any).name,
    },
    likes: feed.likes.map((id: any) => id.toString()),
    comments: feed.comments.map((c: any) => ({
      user: {
        id: c.userId._id.toString(),
        name: c.userId.name,
      },
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    })),
    shares: feed.shares,
    createdAt: feed.createdAt.toISOString(),
  }));
};

export const likePost = async (
  data: LikeFeedRequest,
  userId: string | undefined,
) => {
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
    return await feedModel.updateOne(
      { _id: feedId },
      { $pull: { likes: convertedUserId }, $inc: { likesCount: -1 } },
    );
  } else {
    return await feedModel.updateOne(
      { _id: feedId },
      { $addToSet: { likes: convertedUserId }, $inc: { likesCount: 1 } },
    );
  }
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
    .populate("userId", "name")
    .populate("comments.userId", "name");
  if (!feedToComment) {
    throw new AppError("Feed does not exists");
  }

  const feed = await feedToComment.updateOne(
    { _id: feedId },
    {
      $push: { comments: { convertedUserId }, text },
      $inc: { commentCounts: 1 },
    },
  );

  return {
    id: feed._id.toString(),
    content: feed.content,
    media: feed.media
      ? {
          url: feed.media.url,
          publicId: feed.media.publicId,
        }
      : undefined,
    user: {
      id: feed.userId._id.toString(),
      name: (feed.userId as any).name,
    },
    likes: feed.likes.map((id: any) => id.toString()),
    comments: feed.comments.map((c: any) => ({
      user: {
        id: c.userId._id.toString(),
        name: c.userId.name,
      },
      text: c.text,
      createdAt: c.createdAt.toISOString(),
    })),
    shares: feed.shares,
    createdAt: feed.createdAt.toISOString(),
  };
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
    convertedUserId,
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
