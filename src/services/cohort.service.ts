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
import { Mongoose } from "mongoose";
import userModel from "../models/user.model.js";

export const createCohort = async (
  data: CreateCohortRequest,
): Promise<CreateCohortResponse> => {
  const isInstructor = await instructorProfileModel.findOne({
    instructorId: data.creator,
  });



  const course = await courseModel.findById(data.course);

  if (!course) {
    throw new AppError("course is needed to create a cohort", 400);
  }

  if (data.creator) {
    const isCourseBelongToCohotCreator =
      course.instructor.toString() === data.creator;
    if (!isCourseBelongToCohotCreator) {
      throw new AppError("You are not the instructor of this course", 403);
    }
  }

  if (!course.instructor) {
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

  await cohortModel.findByIdAndUpdate(data.cohortId, {
    $push: { student: data.userId },
  });

  return `student ${user.email} has been added to ${cohort.name}`;
};

export const assignInstructorToCohort = async (
  data: AssignInstructorRequest,
) => {
  const instructor = await instructorProfileModel
    .findOne({ instructorId: data.instructorId })
    .populate("instrutorId", "name");

  if (!instructor) {
    throw new AppError("instructor does not exist", 404);
  }
  const cohort = await cohortModel.findById(data.cohortId);

  if (!cohort) {
    throw new AppError("cant find cohort", 404);
  }

  await cohortModel.findByIdAndUpdate(data.cohortId, {
    creator: instructor.instructorId
  });

  return `cohort ${cohort.name} has been assigned to ${(instructor.instructorId as any ).name}`
};
