import { Types } from "mongoose";

export interface MediaData {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface CreateFeedRequest {
    content: string
    tag?: string
    media?:MediaData
}


export interface CreateFeedResponse {
    tag: {
      titles: string[]
    }
    content: string,
    media?:{
     url: string;
    publicId: string;
    }
}


export interface EditFeedRequest {
    tag: string
    feedId: string
    content: string
    media? :MediaData
}


export interface DeleteFeedRequest {
    feedId: string
}

export interface FeedResponse {
  id: string;
  content: string;
  media?: {
    url: string;
    publicId: string;
  };
  user: {
    id: string;
    name: string;
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

  feedId: string | undefined
}

export interface CommentFeedRequest {

  feedId:string | undefined
  text: string
}


export interface DeleteCommentRequest { 
  feedId: Types.ObjectId
  commentId: Types.ObjectId
}


export enum FeedType {
  FEED="feed",
  WORKSHOP="workshop"
}


export enum FeedTag {
  CYBER_SECURITY="cyberSecurity",
  AI_ENGINEERING="ai-engineering",
  DATA_SCIENCE="data_science"
}


export interface CreateTagRequest {
  titles:string[]
}

export interface CreateTagResponse {
  id: string
  titles:string[]
}