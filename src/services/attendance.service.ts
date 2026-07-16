import { AppError } from "../errors/AppError.js";
import attendanceModel from "../models/attendance.model.js";
import courseModel from "../models/course.model.js";
import {
  CreateAttendanceSessionRequest,
  UpdateAttendanceSessionRequest,
} from "../types/attendance.types.js";
import { getPagination } from "../utils/getPagination.js";
import { validateRequestBodyWithValues } from "../utils/validateRequestBody.js";

export const createAttendanceSession = async (
  userId: string,
  data: CreateAttendanceSessionRequest,
) => {
  validateRequestBodyWithValues<CreateAttendanceSessionRequest>(data, [
    "course",
    "title",
    "date",
  ]);

  const course = await courseModel.findById(data.course);
  if (!course) {
    throw new AppError("course not found", 404);
  }

  return attendanceModel.create({
    course: data.course,
    cohort: data.cohort,
    title: data.title,
    date: data.date,
    records: data.records || [],
    createdBy: userId,
  });
};

export const listAttendanceSessions = async (query: any) => {
  const { page, limit, skip } = getPagination(query);

  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (query.cohort) filter.cohort = query.cohort;
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
  if (query.date) filter.date = new Date(query.date);

  const [sessions, total] = await Promise.all([
    attendanceModel
      .find(filter)
      .populate("course", "title")
      .populate("cohort", "name")
      .populate("createdBy", "name")
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 }),
    attendanceModel.countDocuments(filter),
  ]);

  const summarized = sessions.map((s: any) => {
    const present = s.records.filter((r: any) => r.status === "present").length;
    const absent = s.records.filter((r: any) => r.status === "absent").length;
    const total = s.records.length;
    return {
      _id: s._id.toString(),
      title: s.title,
      course: s.course,
      cohort: s.cohort,
      date: s.date,
      instructor: s.createdBy,
      presentCount: present,
      absentCount: absent,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      approvalStatus: s.approvalStatus,
      createdAt: s.createdAt,
    };
  });

  return {
    sessions: summarized,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getAttendanceSessionById = async (id: string) => {
  const session = await attendanceModel
    .findById(id)
    .populate("course", "title")
    .populate("cohort", "name")
    .populate("records.student", "name email")
    .populate("createdBy", "name");

  if (!session) {
    throw new AppError("attendance session not found", 404);
  }
  return session;
};

export const updateAttendanceSession = async (
  id: string,
  data: UpdateAttendanceSessionRequest,
) => {
  const session = await attendanceModel.findById(id);
  if (!session) {
    throw new AppError("attendance session not found", 404);
  }

  if (data.title !== undefined) session.title = data.title;
  if (data.date !== undefined) session.date = data.date as any;
  if (data.records !== undefined) session.records = data.records as any;

  await session.save();
  return session;
};

export const approveAttendanceSession = async (
  id: string,
  approverId: string,
  approve: boolean,
) => {
  const session = await attendanceModel.findById(id);
  if (!session) {
    throw new AppError("attendance session not found", 404);
  }

  session.approvalStatus = approve ? ("approved" as any) : ("rejected" as any);
  session.approvedBy = approverId as any;
  await session.save();
  return session;
};

export const deleteAttendanceSession = async (id: string) => {
  const session = await attendanceModel.findByIdAndDelete(id);
  if (!session) {
    throw new AppError("attendance session not found", 404);
  }
};

export const getAttendanceReport = async (query: any) => {
  const filter: Record<string, any> = {};
  if (query.course) filter.course = query.course;
  if (query.cohort) filter.cohort = query.cohort;

  const sessions = await attendanceModel.find(filter).populate("records.student", "name email");

  const studentMap: Record<
    string,
    { student: any; attended: number; missed: number; total: number }
  > = {};

  sessions.forEach((session: any) => {
    session.records.forEach((record: any) => {
      const studentId = record.student?._id?.toString();
      if (!studentId) return;

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: record.student,
          attended: 0,
          missed: 0,
          total: 0,
        };
      }

      studentMap[studentId].total += 1;
      if (record.status === "present" || record.status === "late") {
        studentMap[studentId].attended += 1;
      } else if (record.status === "absent") {
        studentMap[studentId].missed += 1;
      }
    });
  });

  return Object.values(studentMap).map((entry) => {
    const rate = entry.total > 0 ? (entry.attended / entry.total) * 100 : 0;
    let status: "good-standing" | "at-risk" | "critical" = "good-standing";
    if (rate < 50) status = "critical";
    else if (rate < 75) status = "at-risk";

    return {
      student: entry.student,
      sessionsAttended: entry.attended,
      sessionsMissed: entry.missed,
      totalSessions: entry.total,
      attendanceRate: Math.round(rate),
      status,
    };
  });
};
