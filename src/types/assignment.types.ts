export enum AssignmentType {
  DOCUMENT = "document",
  PROJECT = "project",
  QUIZ = "quiz",
  CODING = "coding",
}

export enum AssignmentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export enum SubmissionStatus {
  SUBMITTED = "submitted",
  LATE = "late",
  GRADED = "graded",
}

export interface AssignmentMaterialDataRequest {
  title: string;
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface AssignmentMaterialDataResponse {
  title: string;
  url: string;
  publicId: string;
}

export interface CreateAssignmentRequest {
  course: string;
  title: string;
  description: string;
  module: string;
  cohort?: string;
  instructions?: string;
  assignmentType?: string;
  status?: string;
  dueDate?: string;
  totalPoints?: number;
  allowedFileTypes?: string[];
  materials: AssignmentMaterialDataRequest[];
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  instructions?: string;
  cohort?: string;
  assignmentType?: string;
  status?: string;
  dueDate?: string;
  totalPoints?: number;
  allowedFileTypes?: string[];
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  course: string;
  assignmentTitle: string;
  description: string;
  module: string;
  materials: AssignmentMaterialDataResponse[];
}

export interface SubmitAssignmentRequest {
  assignmentId: string;
  studentId: string;
  text?: string;
  file?: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  };
}

export interface GradeSubmissionRequest {
  submissionId: string;
  grade: number;
  feedback?: string;
  graderId: string;
}
