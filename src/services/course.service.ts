import { AppError } from "../errors/AppError.js";
import CourseCategory from "../models/category.model.js";
import { CourseCategoryEnum } from "../types/category.types.js";
import {
  AllAdminCourse,
  CourseLevel,
  CourseStatus,
  CreateCourseRequest,
  CreateCourseResponse,
  SingleAdminCourse,
} from "../types/course.types.js";
import { uploadMedia } from "../utils/uploadToCloudinary.js";
import courseModel from "../models/course.model.js";
import mongoose from "mongoose";
import { deleteImage } from "../utils/uploadToCloudinary.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import { InstructorApplicationStatus } from "../types/instructor.types.js";
import { getPagination } from "../utils/getPagination.js";
import enrollmentModel from "../models/enrollment.model.js";
export const createCourseCategory = async (title: CourseCategoryEnum) => {
  const existing = await CourseCategory.findOne({ title });
  if (existing) {
    throw new AppError("Category already exists", 403);
  }

  const category = await CourseCategory.create({ title });
  return category;
};

// Categories are drawn from a small fixed enum, but course.category stores a
// reference to a CourseCategory document rather than the raw enum value, so
// callers still need document _ids to submit. Self-seeds on first call so
// instructors aren't blocked waiting on an admin to have created them first.
export const listCourseCategories = async () => {
  const existing = await CourseCategory.find();
  if (existing.length > 0) {
    return existing;
  }

  return CourseCategory.insertMany(
    Object.values(CourseCategoryEnum).map((title) => ({ title })),
  );
};

export const createCourse = async (
  data: CreateCourseRequest,
): Promise<CreateCourseResponse> => {
  const uploadResult = await uploadMedia(data.thumbnail.buffer, "image");

  const courseData: any = {
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
  };

  if (data.introVideo) {
    const uploadIntroVidResult = await uploadMedia(
      data.introVideo.buffer,
      "video",
    );

    courseData.introVideo = {
      url: uploadIntroVidResult.secure_url,
      publicId: uploadIntroVidResult.public_id,
      duration: uploadIntroVidResult.duration || 0,
    };
  }

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
    introVideo: course.introVideo
      ? {
          url: course.introVideo.url,
          publicId: course.introVideo.publicId,
          duration: course.introVideo.duration,
        }
      : undefined,
    students: course.students?.map((id) => id.toString()),
    modules: course.modules?.map((id) => id.toString()),
    enrollments: course.enrollments?.map((id) => id.toString()),
    completionCount: course.completionCount,
    completionCertificate: course.completionCertificate,
  };
};

export const updateCourse = async (
  courseId: string,
  data: Partial<CreateCourseRequest>,
): Promise<CreateCourseResponse> => {
  const course = await courseModel.findById(courseId);
  if (!course) throw new Error("Course not found");

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

    const uploadedVideoResult = await uploadMedia(
      data.introVideo.buffer,
      "video",
    );
    course.introVideo = {
      url: uploadedVideoResult.secure_url,
      publicId: uploadedVideoResult.public_id,
      duration: uploadedVideoResult.duration,
    };
  }

  if (data.title !== undefined) course.title = data.title;
  if (data.description !== undefined) course.description = data.description;
  if (data.category !== undefined)
    course.category = new mongoose.Types.ObjectId(data.category);
  if (data.price !== undefined) course.price = data.price;
  if (data.status !== undefined) course.status = data.status as CourseStatus;
  if (data.courseLevel !== undefined)
    course.courseLevel = data.courseLevel as CourseLevel;
  if (data.instructor !== undefined)
    course.instructor = new mongoose.Types.ObjectId(data.instructor);
  if (data.completionCertificate !== undefined)
    course.completionCertificate = data.completionCertificate;

  const updatedCourse = await course.save();

  return {
    _id: updatedCourse._id.toString(),
    title: updatedCourse.title,
    description: updatedCourse.description,
    category: updatedCourse.category.toString(),
    instructor: updatedCourse.instructor?.toString(),
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
    introVideo: updatedCourse.introVideo
      ? {
          url: updatedCourse.introVideo.url,
          publicId: updatedCourse.introVideo.publicId,
          duration: updatedCourse.introVideo.duration,
        }
      : undefined,
  };
};

export const assignInstuctorToCourse = async (
  instructorId: string,
  courseId: string,
): Promise<string> => {
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
    } else {
      throw new AppError("course does not exits", 400);
    }
  } else {
    throw new AppError("Instructor Has not been approved yet", 404);
  }

  return `${(instructor.instructorId as any).name} has been approved to ${courseToAssignInstructorTo.title}`;
};

export const saveCourseAsDraft = async (
  data: CreateCourseRequest,
): Promise<CreateCourseResponse> => {
  const uploadResult = await uploadMedia(data.thumbnail.buffer, "image");
  const courseData: any = {
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
  };

  if (data.introVideo) {
    const uploadIntroVidResult = await uploadMedia(
      data.introVideo.buffer,
      "video",
    );

    courseData.introVideo = {
      url: uploadIntroVidResult.secure_url,
      publicId: uploadIntroVidResult.public_id,
      duration: uploadIntroVidResult.duration || 0,
    };
  }

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
    introVideo: course.introVideo
      ? {
          url: course.introVideo.url,
          publicId: course.introVideo.publicId,
          duration: course.introVideo.duration,
        }
      : undefined,
    students: course.students?.map((id) => id.toString()),
    modules: course.modules?.map((id) => id.toString()),
    enrollments: course.enrollments?.map((id) => id.toString()),
    completionCount: course.completionCount,
    completionCertificate: course.completionCertificate,
  };
};

export const getAllCoursesForAdminDashboard = async (
  data: any,
): Promise<AllAdminCourse> => {
  const { page, limit, skip } = getPagination(data);

  const [courses, total] = await Promise.all([
    courseModel
      .find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "instructor",
        populate: { path: "instructorId", select: "name" },
      }),
    courseModel.countDocuments(),
  ]);

  const courseIds = courses.map((course) => course._id);

  const enrollments = await enrollmentModel.find({
    course: { $in: courseIds },
  });

  const enrollmentCountMap: Record<string, number> = {};

  enrollments.forEach((enroll) => {
    const courseId = enroll.course.toString();
    if (!enrollmentCountMap[courseId]) {
      enrollmentCountMap[courseId] = 0;
    }

    enrollmentCountMap[courseId]++;
  });

  const formattedCourses = courses.map((course) => ({
    _id: course._id.toString(),
    title: course.title,
    category: course.category.toString(),
    description: course.description,
    instructor: (course.instructor as any)?.instructorId?.name || "N/A",
    price: course.price,
    status: course.status,
    enrollments: enrollmentCountMap[course._id.toString()] || 0,
  }));

  return {
    courses: formattedCourses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getASingleCourseForAdminDashboard = async (
  courseId: string,
): Promise<SingleAdminCourse> => {
  if (!courseId) {
    throw new AppError("courseId is required", 404);
  }
  const course = await courseModel.findById(courseId);

  if (!course) {
    throw new AppError("No course is found", 400);
  }

  return {
    _id: course._id.toString(),
    title: course.title,
    category: course.category.toString(),
    description: course.description,
    instructor: (course.instructor as any)?.instructorId?.name || "N/A",
    price: course.price,
    status: course.status,
  };
};

/// ----------- General course browsing (all roles) ---------------///

export const getAllCourses = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (query.instructor) filter.instructor = query.instructor;
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  const [courses, total] = await Promise.all([
    courseModel
      .find(filter)
      .populate("category", "title")
      .populate("instructor", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    courseModel.countDocuments(filter),
  ]);

  const courseIds = courses.map((course) => course._id);
  const enrollments = await enrollmentModel.find({
    course: { $in: courseIds },
  });
  const enrollmentCountMap: Record<string, number> = {};
  enrollments.forEach((enroll) => {
    const courseId = enroll.course.toString();
    enrollmentCountMap[courseId] = (enrollmentCountMap[courseId] || 0) + 1;
  });

  return {
    courses: courses.map((course: any) => ({
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      instructor: course.instructor,
      price: course.price,
      status: course.status,
      courseLevel: course.courseLevel,
      enrollmentCount: enrollmentCountMap[course._id.toString()] || 0,
      createdAt: course.createdAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCourseById = async (courseId: string) => {
  const course = await courseModel
    .findById(courseId)
    .populate("category", "title")
    .populate("instructor", "name email")
    .populate("modules");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

export const deleteCourse = async (
  courseId: string,
  userId: string,
  role: string | undefined,
) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (
    role !== "admin" &&
    course.instructor &&
    course.instructor.toString() !== userId
  ) {
    throw new AppError("You do not own this course", 403);
  }

  if (course.thumbnail?.publicId) {
    await deleteImage(course.thumbnail.publicId);
  }
  if (course.introVideo?.publicId) {
    await deleteImage(course.introVideo.publicId);
  }

  await courseModel.findByIdAndDelete(courseId);
};

export const toggleCoursePublishStatus = async (
  courseId: string,
  userId: string,
  role: string | undefined,
) => {
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (
    role !== "admin" &&
    course.instructor &&
    course.instructor.toString() !== userId
  ) {
    throw new AppError("You do not own this course", 403);
  }

  course.status =
    course.status === CourseStatus.ACTIVE
      ? CourseStatus.DRAFT
      : CourseStatus.ACTIVE;

  await course.save();
  return course;
};

/// ----------- Students Service for Apis  ---------------///
