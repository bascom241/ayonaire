import { AppError } from "../errors/AppError.js";
import CourseCategory from "../models/category.model.js";
import { CourseStatus, } from "../types/course.types.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import courseModel from "../models/course.model.js";
import mongoose from "mongoose";
import { deleteImage } from "../utils/uploadToCloudinary.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import { InstructorApplicationStatus } from "../types/instructor.types.js";
export const createCourseCategory = async (title) => {
    const existing = await CourseCategory.findOne({ title });
    if (existing) {
        throw new AppError("Category already exists", 403);
    }
    const category = await CourseCategory.create({ title });
    return category;
};
export const createCourse = async (data) => {
    const uploadResult = await uploadMedia(data.thumbnail.buffer, "image");
    const uploadIntroVidResult = await uploadMedia(data.introVideo.buffer, "video");
    const courseData = {
        title: data.title,
        description: data.description,
        category: new mongoose.Types.ObjectId(data.category),
        price: data.price,
        status: data.status,
        courseLevel: data.courseLevel,
        thumbnail: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        },
        introVideo: {
            url: uploadIntroVidResult.secure_url,
            publicId: uploadIntroVidResult.public_id,
            duration: uploadIntroVidResult.duration | 0,
        },
    };
    if (data.instructor) {
        courseData.instructor = new mongoose.Types.ObjectId(data.instructor);
    }
    const course = await courseModel.create(courseData);
    return {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category.toString(),
        instructor: course.instructor?.toString(), // optional now
        price: course.price,
        status: course.status,
        courseLevel: course.courseLevel,
        thumbnail: {
            url: course.thumbnail.url,
            publicId: course.thumbnail.publicId,
        },
        introVideo: {
            url: course.introVideo.url,
            publicId: course.introVideo.publicId,
            duration: course.introVideo.duration,
        },
        students: course.students?.map((id) => id.toString()),
        modules: course.modules?.map((id) => id.toString()),
        enrollments: course.enrollments?.map((id) => id.toString()),
        completionCount: course.completionCount,
        completionCertificate: course.completionCertificate,
    };
};
export const updateCourse = async (courseId, data) => {
    const course = await courseModel.findById(courseId);
    if (!course)
        throw new Error("Course not found");
    if (data.thumbnail) {
        if (course.thumbnail?.publicId) {
            await deleteImage(course.thumbnail.publicId);
        }
        const uploadResult = await uploadMedia(data.thumbnail.buffer, "image");
        course.thumbnail = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        };
    }
    if (data.introVideo) {
        if (course.introVideo?.publicId) {
            await deleteImage(course.introVideo.publicId);
        }
        const uploadedVideoResult = await uploadMedia(data.introVideo.buffer, "video");
        course.introVideo = {
            url: uploadedVideoResult.secure_url,
            publicId: uploadedVideoResult.public_id,
            duration: uploadedVideoResult.duration,
        };
    }
    if (data.title !== undefined)
        course.title = data.title;
    if (data.description !== undefined)
        course.description = data.description;
    if (data.category !== undefined)
        course.category = new mongoose.Types.ObjectId(data.category);
    if (data.price !== undefined)
        course.price = data.price;
    if (data.status !== undefined)
        course.status = data.status;
    if (data.courseLevel !== undefined)
        course.courseLevel = data.courseLevel;
    if (data.instructor !== undefined)
        course.instructor = new mongoose.Types.ObjectId(data.instructor);
    const updatedCourse = await course.save();
    return {
        _id: updatedCourse._id.toString(),
        title: updatedCourse.title,
        description: updatedCourse.description,
        category: updatedCourse.category.toString(),
        instructor: updatedCourse.instructor.toString(),
        price: updatedCourse.price,
        status: updatedCourse.status,
        courseLevel: updatedCourse.courseLevel,
        thumbnail: {
            url: updatedCourse.thumbnail.url,
            publicId: updatedCourse.thumbnail.publicId,
        },
        students: updatedCourse.students?.map((id) => id.toString()),
        modules: updatedCourse.modules?.map((id) => id.toString()),
        cohorts: updatedCourse.cohorts.map((id) => id.toString()),
        enrollments: updatedCourse.enrollments.map((id) => id.toString()),
        completionCount: updatedCourse.completionCount,
        completionCertificate: updatedCourse.completionCertificate,
        introVideo: {
            url: course.introVideo.url,
            publicId: course.introVideo.publicId,
            duration: course.introVideo.duration,
        },
    };
};
export const assignInstuctorToCourse = async (instructorId, courseId) => {
    const instructor = await instructorProfileModel
        .findOne({ instructorId: instructorId })
        .populate("instructorId", "name");
    if (!instructor) {
        throw new AppError("instructor not found", 400);
    }
    const courseToAssignInstructorTo = await courseModel.findById(courseId);
    if (instructor.applicationStatus === InstructorApplicationStatus.APPROVED) {
        if (courseToAssignInstructorTo) {
            if (courseToAssignInstructorTo?.instructor) {
                throw new AppError("course already belong to an instructor", 404);
            }
            courseToAssignInstructorTo.instructor = instructor?.instructorId;
            await courseToAssignInstructorTo.save();
        }
        else {
            throw new AppError("course does not exits", 400);
        }
    }
    else {
        throw new AppError("Instructor Has not been approved yet", 404);
    }
    return `${instructor.instructorId.name} has been approved to ${courseToAssignInstructorTo.title}`;
};
export const saveCourseAsDraft = async (data) => {
    const uploadResult = await uploadMedia(data.thumbnail.buffer, "image");
    const uploadIntroVidResult = await uploadMedia(data.introVideo.buffer, "video");
    const courseData = {
        title: data.title,
        description: data.description,
        category: new mongoose.Types.ObjectId(data.category),
        price: data.price,
        status: CourseStatus.DRAFT,
        courseLevel: data.courseLevel,
        thumbnail: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        },
        introVideo: {
            url: uploadIntroVidResult.secure_url,
            publicId: uploadIntroVidResult.public_id,
            duration: uploadIntroVidResult.duration | 0,
        },
    };
    if (data.instructor) {
        courseData.instructor = new mongoose.Types.ObjectId(data.instructor);
    }
    const course = await courseModel.create(courseData);
    return {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        category: course.category.toString(),
        instructor: course.instructor?.toString(), // optional now
        price: course.price,
        status: course.status,
        courseLevel: course.courseLevel,
        thumbnail: {
            url: course.thumbnail.url,
            publicId: course.thumbnail.publicId,
        },
        introVideo: {
            url: course.introVideo.url,
            publicId: course.introVideo.publicId,
            duration: course.introVideo.duration,
        },
        students: course.students?.map((id) => id.toString()),
        modules: course.modules?.map((id) => id.toString()),
        enrollments: course.enrollments?.map((id) => id.toString()),
        completionCount: course.completionCount,
        completionCertificate: course.completionCertificate,
    };
};
/// ----------- Students Service for Apis  ---------------///
