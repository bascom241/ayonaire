import { AppError } from "../errors/AppError.js";
import assignmentModel from "../models/assignment.model.js";
import assignmentSubmissionModel from "../models/assignmentSubmission.model.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import instructorProfileModel from "../models/instructorProfile.model.js";
import moduleModel from "../models/module.model.js";
import {
  AssignmentMaterialDataResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  GradeSubmissionRequest,
  SubmitAssignmentRequest,
  UpdateAssignmentRequest,
} from "../types/assignment.types.js";
import { getPagination } from "../utils/getPagination.js";
import { uploadFile } from "../utils/uploadToCloudinary.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";
const ensureCourseOwnership = async (
  userId: string,
  role: string | undefined,
  courseId: string,
) => {
  if (role === "admin") {
    const course = await courseModel.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }
    return course;
  }

  const instructor = await instructorProfileModel.findOne({
    instructorId: userId,
  });

  if (!instructor) {
    throw new AppError("Instructor profile not found", 400);
  }

  const course = await courseModel.findOne({
    _id: courseId,
    instructor: userId,
  });

  if (!course) {
    throw new AppError("Course for this instructor not found", 404);
  }

  return course;
};

export const createAssignmentForAModule = async (
  userId: string,
  role: string | undefined,
  data: CreateAssignmentRequest,
): Promise<CreateAssignmentResponse> => {
  const courseToUpdate = await ensureCourseOwnership(userId, role, data.course);

  const moduleExistsInCourse = courseToUpdate.modules
    .map((id) => id.toString())
    .includes(data.module);

  if (!moduleExistsInCourse) {
    throw new AppError("Module does not belong to this course", 400);
  }

  // ✅ Check if assignment already exists for module
  const isModuleExistForAssignment = await assignmentModel.findOne({
    module: data.module,
  });

  if (isModuleExistForAssignment) {
    throw new AppError("Assignment already exists for this module", 400);
  }

  // ✅ Upload materials
  const uploadedMaterials: {
    title: string;
    url: string;
    publicId: string;
  }[] = [];

  for (const material of data.materials ?? []) {
    const result = await uploadFile(material.buffer, "raw");

    uploadedMaterials.push({
      title: material.title,
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  const newAssignment = await assignmentModel.create({
    instructor: userId,
    course: data.course,
    cohort: data.cohort || undefined,
    title: data.title,
    description: data.description,
    instructions: data.instructions,
    module: data.module,
    materials: uploadedMaterials,
    assignmentType: data.assignmentType,
    status: data.status,
    dueDate: data.dueDate,
    totalPoints: data.totalPoints,
    allowedFileTypes: data.allowedFileTypes,
  });

  await moduleModel.findByIdAndUpdate(
    data.module,
    { assignment: newAssignment._id },
    { new: true },
  );

  return {
    assignmentId: newAssignment._id.toString(),
    assignmentTitle: newAssignment.title,
    module: newAssignment.module?.toString(),
    course: newAssignment.course.toString(),
    description: newAssignment.description,
    materials: newAssignment.materials.map((material) => ({
      title: material.title ?? "",
      url: material.url ?? "",
      publicId: material.publicId ?? "",
    })),
  };
};

export const listAssignments = async (
  userId: string,
  role: string | undefined,
  query: any,
) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (query.module) filter.module = query.module;
  if (query.status) filter.status = query.status;
  if (query.cohort) filter.cohort = query.cohort;

  if (role !== "admin") {
    filter.instructor = userId;
  } else if (query.instructor) {
    filter.instructor = query.instructor;
  }

  const [assignments, total] = await Promise.all([
    assignmentModel
      .find(filter)
      .populate("course", "title")
      .populate("cohort", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    assignmentModel.countDocuments(filter),
  ]);

  const assignmentIds = assignments.map((a) => a._id);
  const submissionCounts = await assignmentSubmissionModel.aggregate([
    { $match: { assignment: { $in: assignmentIds } } },
    { $group: { _id: "$assignment", count: { $sum: 1 } } },
  ]);
  const submissionCountMap: Record<string, number> = {};
  submissionCounts.forEach((s) => {
    submissionCountMap[s._id.toString()] = s.count;
  });

  const enrollmentCounts = await enrollmentModel.aggregate([
    { $match: { course: { $in: assignments.map((a) => a.course) } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const enrollmentCountMap: Record<string, number> = {};
  enrollmentCounts.forEach((e) => {
    enrollmentCountMap[e._id.toString()] = e.count;
  });

  return {
    assignments: assignments.map((a: any) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description,
      course: a.course
        ? { _id: a.course._id.toString(), title: a.course.title }
        : null,
      cohort: a.cohort
        ? { _id: a.cohort._id.toString(), name: a.cohort.name }
        : null,
      module: a.module.toString(),
      assignmentType: a.assignmentType,
      status: a.status,
      dueDate: a.dueDate,
      totalPoints: a.totalPoints,
      totalStudents: enrollmentCountMap[a.course?._id?.toString()] || 0,
      submissionsCount: submissionCountMap[a._id.toString()] || 0,
      createdAt: a.createdAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAssignmentById = async (assignmentId: string) => {
  const assignment = await assignmentModel
    .findById(assignmentId)
    .populate("course", "title")
    .populate("cohort", "name")
    .populate("module", "title");

  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  return assignment;
};

export const updateAssignment = async (
  assignmentId: string,
  userId: string,
  role: string | undefined,
  data: UpdateAssignmentRequest,
) => {
  const assignment = await assignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  if (role !== "admin" && assignment.instructor.toString() !== userId) {
    throw new AppError("You do not own this assignment", 403);
  }

  if (data.title !== undefined) assignment.title = data.title;
  if (data.description !== undefined) assignment.description = data.description;
  if (data.instructions !== undefined)
    assignment.instructions = data.instructions;
  if (data.cohort !== undefined) assignment.cohort = data.cohort as any;
  if (data.assignmentType !== undefined)
    assignment.assignmentType = data.assignmentType as any;
  if (data.status !== undefined) assignment.status = data.status as any;
  if (data.dueDate !== undefined) assignment.dueDate = data.dueDate as any;
  if (data.totalPoints !== undefined) assignment.totalPoints = data.totalPoints;
  if (data.allowedFileTypes !== undefined)
    assignment.allowedFileTypes = data.allowedFileTypes;

  await assignment.save();
  return assignment;
};

export const deleteAssignment = async (
  assignmentId: string,
  userId: string,
  role: string | undefined,
) => {
  const assignment = await assignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  if (role !== "admin" && assignment.instructor.toString() !== userId) {
    throw new AppError("You do not own this assignment", 403);
  }

  await assignmentSubmissionModel.deleteMany({ assignment: assignmentId });
  await moduleModel.findByIdAndUpdate(assignment.module, {
    $unset: { assignment: "" },
  });
  await assignmentModel.findByIdAndDelete(assignmentId);
};

export const submitAssignment = async (data: SubmitAssignmentRequest) => {
  validateRequestBodyWithValues<{ assignmentId: string; studentId: string }>(
    data,
    ["assignmentId", "studentId"],
  );

  const assignment = await assignmentModel.findById(data.assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  const enrollment = await enrollmentModel.findOne({
    student: data.studentId,
    course: assignment.course,
  });
  if (!enrollment) {
    throw new AppError("You are not enrolled in this course", 403);
  }

  if (!data.text && !data.file) {
    throw new AppError("Provide either text or a file for the submission", 400);
  }

  const isLate = Boolean(
    assignment.dueDate && new Date() > new Date(assignment.dueDate),
  );

  const submissionData: Record<string, any> = {
    text: data.text,
    status: isLate ? "late" : "submitted",
  };

  if (data.file) {
    const result = await uploadFile(data.file.buffer, "raw");
    submissionData.file = {
      url: result.secure_url,
      publicId: result.public_id,
      name: data.file.originalname,
    };
  }

  const submission = await assignmentSubmissionModel.findOneAndUpdate(
    { assignment: data.assignmentId, student: data.studentId },
    {
      $set: {
        ...submissionData,
        assignment: data.assignmentId,
        student: data.studentId,
        course: assignment.course,
      },
    },
    { upsert: true, new: true },
  );

  return submission;
};

export const listSubmissionsForAssignment = async (
  assignmentId: string,
  userId: string,
  role: string | undefined,
) => {
  const assignment = await assignmentModel.findById(assignmentId);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  if (role !== "admin" && assignment.instructor.toString() !== userId) {
    throw new AppError("You do not own this assignment", 403);
  }

  const submissions = await assignmentSubmissionModel
    .find({ assignment: assignmentId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  return submissions;
};

export const listAllSubmissions = async (
  userId: string,
  role: string | undefined,
  query: any,
) => {
  const { page, limit, skip } = getPagination(query);

  const assignmentFilter: Record<string, any> = {};
  if (role !== "admin") assignmentFilter.instructor = userId;
  if (query.course) assignmentFilter.course = query.course;

  const assignmentIds = await assignmentModel
    .find(assignmentFilter)
    .distinct("_id");

  const filter: Record<string, any> = { assignment: { $in: assignmentIds } };
  if (query.status) filter.status = query.status;
  if (query.assignment) filter.assignment = query.assignment;

  const [submissions, total] = await Promise.all([
    assignmentSubmissionModel
      .find(filter)
      .populate("student", "name email")
      .populate("assignment", "title course")
      .populate("course", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    assignmentSubmissionModel.countDocuments(filter),
  ]);

  return {
    submissions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const gradeSubmission = async (data: GradeSubmissionRequest) => {
  validateRequestBodyWithValues<{ submissionId: string; grade: number }>(
    data,
    ["submissionId", "grade"],
  );

  const submission = await assignmentSubmissionModel.findById(
    data.submissionId,
  );
  if (!submission) {
    throw new AppError("Submission not found", 404);
  }

  submission.grade = data.grade;
  submission.feedback = data.feedback;
  submission.status = "graded" as any;
  submission.gradedAt = new Date();
  submission.gradedBy = data.graderId as any;
  await submission.save();

  return submission;
};
