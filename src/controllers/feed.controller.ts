import { editFeed, createFeed, viewFeeds, deleteFeed, likePost, commentOnAPost, deleteComment } from "../services/feed.service.js";
import { Response, Request, NextFunction } from "express";
import { CommentFeedRequest, CreateFeedRequest, DeleteCommentRequest, DeleteFeedRequest, EditFeedRequest, LikeFeedRequest } from "../types/feed.types.js";
import mongoose from "mongoose";

export interface AuthRequest<T = any> extends Request {
  body: T;
  user?: { id: string; email?: string };
}

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {content} = req.body
        const userId = req.user?.id;
        const dataToSend : CreateFeedRequest = {
            content,
            media: req.file
        }
        const data = await createFeed(dataToSend, userId);
        res.status(201).json({success: true ,data})
    } catch (error) {
        next(error)
    }
}

export const edit = async (req: AuthRequest, res: Response , next: NextFunction) => {
    try {
   
        const {content, feedId} = req.body;
      const userId = req.user?.id;
        const dataToSend: EditFeedRequest = {
            feedId,
            content,
            media: req.file
        }

        const data = await editFeed(dataToSend, userId);
        res.status(200).json({success: true, data})
    } catch (error) {
        next(error)
    }
}


export const deleteF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {feedId} = req.body;
        const userId = req.user?.id;

        const dataToSend: DeleteFeedRequest = {
            feedId
        };

        const data = await deleteFeed(dataToSend, userId);
        res.status(200).json({success: true, data})
    } catch (error) {
        next(error)
    }
}

export const view = async (req: Request, res:Response, next: NextFunction) => {
    try{
        const data = await viewFeeds();
        res.status(200).json({success: true, data})
    }catch(err){
        next(err)
    }
}


export const likeFeed = async( req : AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {feedId} = req.body;
        const userId = req.user?.id;
        const dataToSend: LikeFeedRequest = {
            feedId
        };
        const data = await likePost(dataToSend, userId);
        res.status(200).json ({success: true, message: "Feed liked", data})
    } catch (error) {
        next(error);
    }
}

export const commentOnAfeed = async(req: AuthRequest, res : Response, next: NextFunction) => {
    try {

        const userId = req.user?.id;
        const {feedId, text} = req.body;
        const dataToSend: CommentFeedRequest = {
       
            feedId, 
            text
        }


        const data = await commentOnAPost( dataToSend, userId);
        res.status(200).json({success:true, data, message:"commented successfully "})
    } catch (error) {
        next(error)
    }
}


export const deleteC = async(req:AuthRequest, res: Response, next: NextFunction) => {
        try {
            
        const userId = req.user?.id;
        const {feedId, commentId} = req.body;
        const dataToSend: DeleteCommentRequest = {
            feedId,
            commentId
        };
        const data = await deleteComment(dataToSend, userId);
        res.status(200).json({success: true, message: data})
        } catch (error) {
            next(error)
        }
}
