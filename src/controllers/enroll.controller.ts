import { NextFunction, Request, Response } from "express";
import { viewEnrolledCourses } from "../services/enroll.service.js";
import { AppError } from "../errors/AppError.js";



interface AuthRequest extends Request {
    user ? : {id? : string }
}

export const enrolledCourses = async (req:AuthRequest , res: Response, next: NextFunction) => {
    try {
        const id = req.user?.id
        if(!id){
            throw new AppError("unauthorized", 401)
        };


        const data = await viewEnrolledCourses(id);

        res.status(200).json({success: true , data })
    } catch (error) {
        next(error)
    }
}