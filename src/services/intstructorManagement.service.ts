// 2️⃣ Instructor Management
// • Approve or reject instructor applications
// • View instructor profiles and activity
// • Assign instructors to courses or classes
// • Suspend or delete instructor accounts

// Instructor first need to create an account with us
// first get insrtuctor that want to apply to ayonaire
// we collect the id of that istructor and get the information
// we change the status of that instructor
// editInstructorApplicationStatus

import { AppError } from "../errors/AppError.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import User from "../models/user.model.js";
import {
  Instructor,
  InstructorApplicationStatus,
} from "../types/instructor.types.js";
import { UserRole } from "../types/user.types.js";
import {
  instructorRequest,
  InstructorProfileResponse,
} from "../types/instructor.types.js";
import categoryModel from "../models/category.model.js";

export const applyAsInstructor = async (
  userId: string | undefined,
  data: instructorRequest,
): Promise<Instructor> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("user does not exist", 404);
  }

  const existingInstructor = await instructorProfileModel.findOne({
    instructorId: userId,
  });

  if (existingInstructor) {
    throw new AppError("instructor account created for this user", 403);
  }

  const categoryExists = await categoryModel.findById(
    data.instructorCourseCategory,
  );
  if (!categoryExists) {
    throw new AppError("selected course category does not exist", 403);
  }

  const instructor = await instructorProfileModel.create({
    instructorId: userId,
    bio: data.bio,
    expertise: data.expertise,
    instructorCourseCategory: data.instructorCourseCategory,
    applicationStatus: InstructorApplicationStatus.PENDING,
  });

  return instructor;
};

export const approveInstructorApplicationStatus = async (userId: string): Promise<string> => {

  const instructor = await instructorProfileModel
    .findOne({ instructorId: userId })
    .populate("instructorId", "name");

  if (!instructor) {
    throw new AppError("Instructor application not found", 404);
  }

 
  if (instructor.applicationStatus === InstructorApplicationStatus.APPROVED) {
    throw new AppError("Instructor already approved", 403);
  }

 
  instructor.applicationStatus = InstructorApplicationStatus.APPROVED;
  await instructor.save();

  
  await User.findByIdAndUpdate(userId, { role: UserRole.INSTRUCTOR });


  return `${(instructor.instructorId as any).name} is approved`;
};

export const rejectInstructorApplicationStatus = async (
  userId: string,
): Promise<string> => {

   const instructor = await instructorProfileModel
    .findOne({ instructorId: userId })
    .populate("instructorId", "name");

  if (!instructor) {
    throw new AppError("user not found", 404);
  }

  if (instructor.applicationStatus === InstructorApplicationStatus.REJECTED) {
    throw new AppError("instructor alraedy rejected", 403);
  }

  await instructorProfileModel.findOneAndUpdate(
    { instructorId: userId },
    { applicationStatus: InstructorApplicationStatus.REJECTED },
  );

  await User.findByIdAndUpdate(userId, { role: UserRole.USER });

  return `${(instructor.instructorId as any).name} is rejected`;
};

export const getInstructorProfiles = async (): Promise<
  InstructorProfileResponse[]
> => {
  const instructors = await instructorProfileModel
    .find()
    .populate({
      path: "instructorId",
      select: "name email loginHistory activity",
    })
    .populate({
      path: "instructorCourseCategory",
      select: "title",
    });

  return instructors.map((inst: any) => ({
    instructorId: {
      name: inst.instructorId.name,
      email: inst.instructorId.email,
      loginHistory: inst.instructorId.loginHistory,
      activity: inst.instructorId.activity,
    },
    bio: inst.bio,
    expertise: inst.expertise,
    instructorCourseCategory: inst.instructorCourseCategory.title,
    applicationStatus: inst.applicationStatus,
  }));
};

export const getInstructorProfile = async (
  id: string,
): Promise<InstructorProfileResponse> => {
  const instructor = await instructorProfileModel
    .findOne({ instructorId: id })
    .populate({
      path: "instructorId",
      select: "name email loginHistory activity",
    })
    .populate({
      path: "instructorCourseCategory",
      select: "title",
    })
    .lean();

  if (!instructor) {
    throw new AppError("Instructor profile not found", 404);
  }

  const populatedUser = instructor.instructorId as any;
  const populatedCategory = instructor.instructorCourseCategory as any;

  return {
    instructorId: {
      name: populatedUser.name,
      email: populatedUser.email,
      loginHistory: populatedUser.loginHistory,
      activity: populatedUser.activity,
    },
    bio: instructor.bio,
    expertise: instructor.expertise,
    instructorCourseCategory: populatedCategory.title,
    applicationStatus: instructor.applicationStatus,
  };
};
