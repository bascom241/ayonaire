import { Types } from "mongoose";

export interface MediaData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

// Which community "space" a post belongs to - distinct from `tag` (topic
// labels like AI Engineering / Data Science). GENERAL is both the default
// and what the main Feed page shows unfiltered (all channels mixed); the
// other values back their own dedicated space page. Announcements and Ask
// for Help are NOT here - those are separate models/features entirely.
export enum FeedChannel {
  GENERAL = "general",
  INTRODUCTIONS = "introductions",
  GENERAL_DISCUSSION = "general-discussion",
}

export interface CreateFeedRequest {
  content: string;
  tag?: string;
  channel?: string;
  media?: MediaData;
}

export interface CreateFeedResponse {
  tag?: string[];
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
}

export interface EditFeedRequest {
  tag: string;
  feedId: string;
  content: string;
  channel?: string;
  media?: MediaData;
}

export interface DeleteFeedRequest {
  feedId: string;
}

export interface FeedResponse {
  id: string;
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
  tag?: string[];
  channel: string;
  user: {
    id: string;
    name: string;
    profile?: {
      url: string;
      publicId: string;
    } | null;
  };
  likes: string[];
  comments: {
    user: {
      id: string;
      name?: string;
    };
    text: string;
    createdAt: string;
  }[];
  shares: number;
  createdAt: string;
}

export interface LikeFeedRequest {
  feedId: string | undefined;
}

export interface CommentFeedRequest {
  feedId: string | undefined;
  text: string;
}

export interface DeleteCommentRequest {
  feedId: Types.ObjectId;
  commentId: Types.ObjectId;
}

export enum FeedType {
  FEED = "feed",
  WORKSHOP = "workshop",
}

export enum FeedTag {
  CYBER_SECURITY = "cyberSecurity",
  AI_ENGINEERING = "ai-engineering",
  DATA_SCIENCE = "data_science",
}

export interface CreateTagRequest {
  titles: string[];
}

export interface CreateTagResponse {
  id: string;
  titles: string[];
}

export interface ShareFeedRequest {
  feedId: string | undefined;
}

export interface ShareFeedResponse {
  feedId: string;
  shares: number;
}

export interface ReportFeedRequest {
  feedId: string | undefined;
  reason: string;
}

export interface ViewFeedsQuery {
  tag?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export interface CommunityStatsResponse {
  totalMembers: number;
  totalPosts: number;
  totalAnnouncements: number;
  postsToday: number;
}
