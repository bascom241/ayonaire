import cohortModel from "../models/cohort.model.js";
import {
  AssignInstructorRequest,
  AssignStudentRequest,
  CreateCohortRequest,
  CreateCohortResponse,
} from "../types/cohort.types.js";

import instructorProfileModel from "../models/instructorProfile.model.js";
import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import { getPagination } from "../utils/getPagination.js";

export const createCohort = async (
  data: CreateCohortRequest,
): Promise<CreateCohortResponse> => {
  const course = await courseModel.findById(data.course);

  if (!course) {
    throw new AppError("course is needed to create a cohort", 400);
  }

  if (data.creator && course.instructor) {
    const isCourseBelongToCohotCreator =
      course.instructor.toString() === data.creator;
    if (!isCourseBelongToCohotCreator) {
      throw new AppError("You are not the instructor of this course", 403);
    }
  }

  if (data.creator && !course.instructor) {
    throw new AppError("Only admins can create cohort for this course", 403);
  }

  const cohort = await cohortModel.create({
    name: data.name,
    description: data.description,
    creator: data.creator,
    course: data.course,
    isActive: data.isActive,
  });

  return {
    name: cohort.name,
    description: cohort.description || undefined,
    creator: cohort.creator?.toString(),
    course: cohort.course.toString(),
    isActive: cohort.isActive,
    students: cohort.students.map((s) => s.toString()),
  };
};

export const assignStudentToCohort = async (data: AssignStudentRequest) => {
  const user = await userModel.findById(data.userId);

  if (!user) {
    throw new AppError("cant find student", 404);
  }

  const cohort = await cohortModel.findById(data.cohortId);

  if (!cohort) {
    throw new AppError("cant find cohhort", 404);
  }

  const isStudentExistsInCohort = await cohortModel.exists({
    _id: data.cohortId,
    students: { $in: [data.userId] },
  });

  if (isStudentExistsInCohort) {
    throw new AppError("Student already exists in this cohort", 400);
  }
  await cohortModel.findByIdAndUpdate(data.cohortId, {
    $push: { students: data.userId },
  });

  return `student ${user.email} has been added to ${cohort.name}`;
};

export const assignInstructorToCohort = async (
  data: AssignInstructorRequest,
) => {
  const instructor = await instructorProfileModel
    .findOne({ instructorId: data.instructorId })
    .populate("instructorId", "name");

  if (!instructor) {
    throw new AppError("instructor does not exist", 404);
  }
  const cohort = await cohortModel.findById(data.cohortId);

  if (!cohort) {
    throw new AppError("cant find cohort", 404);
  }

  await cohortModel.findByIdAndUpdate(data.cohortId, {
    creator: instructor.instructorId,
  });

  return `cohort ${cohort.name} has been assigned to ${(instructor.instructorId as any).name}`;
};

export const listCohorts = async (
  userId: string,
  role: string | undefined,
  query: any,
) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (role !== "admin") filter.creator = userId;

  const [cohorts, total] = await Promise.all([
    cohortModel
      .find(filter)
      .populate("course", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    cohortModel.countDocuments(filter),
  ]);

  return {
    cohorts: cohorts.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      description: c.description,
      course: c.course
        ? { _id: c.course._id.toString(), title: c.course.title }
        : null,
      studentsCount: c.students.length,
      isActive: c.isActive,
      createdAt: c.createdAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCohortById = async (cohortId: string) => {
  const cohort = await cohortModel
    .findById(cohortId)
    .populate("course", "title")
    .populate("students", "name email");

  if (!cohort) {
    throw new AppError("cohort not found", 404);
  }

  return cohort;
};
