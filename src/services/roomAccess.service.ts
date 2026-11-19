import { AppError } from "../errors/AppError.js";
import courseModel from "../models/course.model.js";
import enrollmentModel from "../models/enrollment.model.js";
import userModel from "../models/user.model.js";

// Course membership is rechecked against current enrollment, not just the
// participant array, which may still contain students whose enrollment ended.
export async function assertCurrentCourseRoomAccess(room: any, userId: string) {
  if (!room?.course) return;
  const course = await courseModel.findById(room.course);
  if (!course) throw new AppError("Course conversation is unavailable", 403);
  if (course?.instructor?.toString() === userId) return;
  const enrollment = await enrollmentModel.exists({ course: room.course, student: userId, status: { $ne: "cancelled" } });
  if (enrollment) return;
  const user = await userModel.findById(userId).select("role");
  if (user?.role === "admin") return;
  throw new AppError("You no longer have access to this course conversation", 403);
}
