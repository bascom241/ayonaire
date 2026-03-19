import { AppError } from "../errors/AppError.js";
import enrollmentModel from "../models/enrollment.model.js";
import lessonModel from "../models/lesson.model.js";
import moduleModel from "../models/module.model.js";
import mongoose, { PipelineStage, Types } from "mongoose"
import {
  UploadLessonRequest,
  UploadLessonResponse,
  UploadVideoReponse,
  UploadVideoRequest,
  MarkLessonCompleted,
  ResumeLessonRequest,
 UpdateLastLesson,
 UpdateLastLessonResponse,
 ViewLessonRequest
} from "../types/lesson.types.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import { MarkLessonCompletedEnrollmentResponse } from "../types/enrollment.types.js";
export const uploadLesson = async (
  data: UploadLessonRequest,
): Promise<UploadLessonResponse> => {
  const lessonData: UploadLessonRequest = {
    title: data.title,
    module: data.module,
    course: data.course,
    order: data.order,
  };

  const isModule = await moduleModel.findById(lessonData.module);
  if (!isModule) {
    throw new AppError("module Id is required", 400);
  }
  const isCourse = await moduleModel.findById(lessonData.course);
  if (isCourse) {
    throw new AppError("course Id is required", 400);
  }

  const lesson = await lessonModel.create(lessonData);

  await moduleModel.findByIdAndUpdate(lessonData.module, {
    $push: { lessons: lesson._id },
  });

  return {
    _id: lesson.id.toString(),
    title: lesson.title,
    module: lesson.module.toString(),
    course: lesson.course.toString(),
    order: lesson.order,
    isPublished: lesson.isPublished,
    isFreePreview: lesson.isFreePreview,
    isLocked: lesson.isLocked,
  };
};

const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

export const uploadVideo = async (
  lessonId: string,
  data: UploadVideoRequest,
): Promise<UploadVideoReponse> => {
  const lesson = await lessonModel.findById(lessonId);
  if (!lesson) {
    throw new AppError("lesson not found", 400);
  }

  let uploadedVideos = [];

  for (const video of data.videos) {
    if (video.buffer.length > MAX_VIDEO_SIZE) {
      throw new AppError(`Cant upload. ${video.title} exceeds 30mb`);
    }

    const result = await uploadMedia(video.buffer, "video");

    uploadedVideos.push({
      title: video.title,
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
    });
  }
  lesson.videos.push(...uploadedVideos);

  const result = await lesson.save();

  return {
    title: result.videos.map((t) => t.title),
    url: result.videos.map((u) => u.url),
    publicId: result.videos.map((p) => p.publicId),
    duration: result.videos.map((d) => d.duration),
  };
};


export const markLessonAsCompleted = async (data: MarkLessonCompleted): Promise<MarkLessonCompletedEnrollmentResponse> => {
  const enrollment = await enrollmentModel.findOne({
    student: data.studentId,
    course: data.courseId
  });

  if(!enrollment){
    throw new AppError("enrollment not fount", 404)
  }
  if(!enrollment.comletedLessons.includes(data.lessonId)){
    enrollment.comletedLessons.push(new mongoose.Types.ObjectId(data.lessonId))
  }

  const totalLessons = await lessonModel.countDocuments({
    course: data.courseId,
    isPublished: true
  });

  enrollment.progress = (enrollment.comletedLessons.length / totalLessons) * 100

  if(enrollment.progress === 100){
    enrollment.completed = true
  }
  await enrollment.save();

  return {
    course: enrollment.course.toString(),
    student: enrollment.course.toString(),
    status: enrollment.status,
    completedLessons: enrollment.comletedLessons.map((id) =>id.toString()),
    progress: enrollment.progress,
    completed: enrollment.completed
  }
}


export const updateLastLesson = async (data: UpdateLastLesson):Promise<UpdateLastLessonResponse> => {
    const enrollment = await enrollmentModel.findOne({
    student: data.studentId,
    course: data.courseId
  });

  if(!enrollment){
    throw new AppError("enrollment not fount", 404)
  }

  const updatedEnrollmentLastLesson = await enrollmentModel.findOneAndUpdate(
     { student: data.studentId, course: data.courseId },
    { lastLesson: data.lessonId }
  );


  if(!updatedEnrollmentLastLesson){
    throw new AppError("could not update last lesson", 400)
  }

  return {
      course: updatedEnrollmentLastLesson.course.toString(),
    student: updatedEnrollmentLastLesson.course.toString(),
    status: updatedEnrollmentLastLesson.status,
    completedLessons: updatedEnrollmentLastLesson.comletedLessons.map((id) =>id.toString()),
    progress: updatedEnrollmentLastLesson.progress,
    completed: updatedEnrollmentLastLesson.completed,
    lastLesson:  updatedEnrollmentLastLesson.lastLesson ?  updatedEnrollmentLastLesson.lastLesson.toString() : null 
    
  }
}

export const getResumeLesson = async (data: ResumeLessonRequest) => {
    const enrollment = await enrollmentModel.findOne({
      student: data.studentId,
      course: data.courseId
    });
    if(!enrollment){
      throw new AppError("enrollment not found",  400)
    }

  
  if (enrollment.lastLesson) {
    return enrollment.lastLesson;
  }

  // fallback → return first lesson
  const firstLesson = await lessonModel.findOne({
    course: data.courseId,
    isPublished: true
  }).sort({ order: 1 });

  return firstLesson?._id;
}

export const viewLessonContent = async (data: ViewLessonRequest) =>{
    const myEnrollment = await enrollmentModel.findOne({
      student: data.studentId,
      course: data.courseId
    });

    if(!myEnrollment){
      throw new AppError("you are not enrolled for this course", 401)
    }

    const pipeline: PipelineStage[] = [

      {
        $match  : {
          course: new Types.ObjectId(data.courseId)
        }
      },
      {
        $sort: {order : 1}
      },
      {
        $lookup: {
          from :"lessons", 
          localField: "_id",
          foreignField: "module",
          as: "lessons"
        }
      },

      {
        $addFields: {
          lessons: {
            $sortArray: {
              input: "$lessons",
              sortBy: {order: 1 }
            }
          }
        }
      },

      {
        $addFields : {
          lessons : {
            $map : {
              input: "$lessons",
              as: "lesson",
              in: {
                $mergeObjects : [
                  "$$lesson",

                  {
                    isCompleted: {
                      $in : [
                        "$$lesson._id", 
                        myEnrollment.comletedLessons
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];
  const modules = await moduleModel.aggregate(pipeline);

  return {
    modules,
    progress: myEnrollment.progress,
    lastLesson: myEnrollment.lastLesson
  };

  

}