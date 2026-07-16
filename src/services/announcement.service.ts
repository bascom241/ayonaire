import {
  sendAnnouncementToStudentsInACohort,
  sendAnnouncementToStudentsInACourse,
} from "../config/mail.js";
import { AppError } from "../errors/AppError.js";
import announcementModel from "../models/announcement.model.js";
import cohortModel from "../models/cohort.model.js";
import courseModel from "../models/course.model.js";
import userModel from "../models/user.model.js";
import {
  AnnouncementResponse,
  CreateAnnouncement,
  CreateAnnouncementResponse,
  UpdateAnnouncementRequest,
} from "../types/announcement.types.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";

export const createAnnouncement = async (
  data: CreateAnnouncement,
): Promise<CreateAnnouncementResponse> => {
  validateRequestBodyWithValues<CreateAnnouncement>(data, ["title", "summary"]);
  const { title, summary, cohortId, courseId, students } = data;
  const excludedKeys = [title, summary];
  const hasAtLeastOne = Object.entries(data).some(
    ([key, value]) => !excludedKeys.includes(key) && Boolean(value),
  );
  if (!hasAtLeastOne) {
    throw new AppError("At leat one value must be provided", 400);
  }

  const commonFields = {
    title,
    summary,
    createdBy: data.createdBy,
    status: data.status,
    scheduledAt: data.scheduledAt,
  };

  if (cohortId) {
    const cohort = await cohortModel
      .findById(cohortId)
      .populate("students", "email");
    if (!cohort) {
      throw new AppError("cohort not found", 404);
    }
    if (!cohort.students || cohort.students.length === 0) {
      throw new AppError("no students found for this cohort", 400);
    }
    const studentEmails = cohort.students.map((student: any) => student.email);
    await sendAnnouncementToStudentsInACohort(studentEmails, title, summary);

    const announcment = await announcementModel.create({
      ...commonFields,
      audience: cohort.name,
      cohort: cohortId,
    });

    return {
      id: announcment._id.toString(),
      audience: announcment.audience,
      title: announcment.title,
      summary: announcment.summary,
    };
  }

  if (courseId) {
    const course = await courseModel
      .findById(courseId)
      .populate("students", "email");
    if (!course) {
      throw new AppError("cohort not found", 404);
    }

    if (!course.students || (course.students as any[]).length === 0) {
      throw new AppError("no students found for this course", 400);
    }
    const studentEmails = course.students.map((student: any) => student.email);
    await sendAnnouncementToStudentsInACourse(studentEmails, title, summary);

    const announcment = await announcementModel.create({
      ...commonFields,
      audience: course.title,
      course: courseId,
    });

    return {
      id: announcment._id.toString(),
      audience: announcment.audience,
      title: announcment.title,
      summary: announcment.summary,
    };
  }

  if (students) {
    const existingStudents: string[] = [];
    const existingStudentIds: string[] = [];
    const nonExistentStudents: string[] = [];

    for (const studentEmail of students) {
      const isStudentExist = await userModel.findOne({ email: studentEmail });

      if (isStudentExist) {
        existingStudents.push(studentEmail);
        existingStudentIds.push(isStudentExist._id.toString());
      } else {
        nonExistentStudents.push(studentEmail);
        console.log(`Student not found in platform: ${studentEmail}`);
      }
    }

    console.log(
      `Found ${existingStudents.length} existing students, excluded ${nonExistentStudents.length} non-existent users`,
    );

    if (existingStudents.length > 0) {
      await sendAnnouncementToStudentsInACourse(
        existingStudents,
        title,
        summary,
      );

      const announcment = await announcementModel.create({
        ...commonFields,
        audience: "Specific students",
        students: existingStudentIds,
      });

      return {
        id: announcment._id.toString(),
        audience: announcment.audience,
        title: announcment.title,
        summary: announcment.summary,
      };
    } else {
      throw new AppError("No valid students found in the platform", 400);
    }
  }

  throw new AppError("could no send announcement", 400);
};

export const getAllAnnounceMents = async (
  data: any,
): Promise<AnnouncementResponse> => {
  const { page, skip, limit } = getPagination(data);

  const filter: Record<string, any> = {};
  if (data.course) filter.course = data.course;
  if (data.cohort) filter.cohort = data.cohort;
  if (data.createdBy) filter.createdBy = data.createdBy;
  if (data.status) filter.status = data.status;

  const [announcements, total] = await Promise.all([
    announcementModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    announcementModel.countDocuments(filter),
  ]);

  const formattedAnnouceMent = announcements.map((announcement) => ({
    id: announcement._id.toString(),
    audience: announcement.audience,
    title: announcement.title,
    summary: announcement.summary,
    course: announcement.course ? announcement.course.toString() : null,
    cohort: announcement.cohort ? announcement.cohort.toString() : null,
    createdBy: announcement.createdBy ? announcement.createdBy.toString() : null,
    status: announcement.status,
    views: announcement.views,
    createdAt: (announcement as any).createdAt,
  }));

  return {
    announcement: formattedAnnouceMent,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateAnnouncement = async (
  announcementId: string,
  userId: string,
  role: string | undefined,
  data: UpdateAnnouncementRequest,
) => {
  const announcement = await announcementModel.findById(announcementId);
  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  if (
    role !== "admin" &&
    announcement.createdBy &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new AppError("You do not own this announcement", 403);
  }

  if (data.title !== undefined) announcement.title = data.title;
  if (data.summary !== undefined) announcement.summary = data.summary;
  if (data.status !== undefined) announcement.status = data.status as any;
  if (data.scheduledAt !== undefined)
    announcement.scheduledAt = data.scheduledAt as any;

  await announcement.save();
  return announcement;
};

export const deleteAnnouncement = async (
  announcementId: string,
  userId: string,
  role: string | undefined,
) => {
  const announcement = await announcementModel.findById(announcementId);
  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  if (
    role !== "admin" &&
    announcement.createdBy &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new AppError("You do not own this announcement", 403);
  }

  await announcementModel.findByIdAndDelete(announcementId);
};
