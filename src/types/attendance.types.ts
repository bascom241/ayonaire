export enum AttendanceRecordStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  UNMARKED = "unmarked",
}

export enum AttendanceApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface AttendanceRecordInput {
  student: string;
  status: string;
  timeIn?: string;
  timeOut?: string;
  notes?: string;
}

export interface CreateAttendanceSessionRequest {
  course: string;
  cohort?: string;
  title: string;
  date: string;
  records: AttendanceRecordInput[];
}

export interface UpdateAttendanceSessionRequest {
  title?: string;
  date?: string;
  records?: AttendanceRecordInput[];
}
