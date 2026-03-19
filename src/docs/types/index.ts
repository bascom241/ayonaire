export enum UserRole {
  USER = "user",
  INSTRUCTOR = "instructor",
  ADMIN = "admin"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

export enum CourseStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped"
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  FAILED = "failed"
}

export enum InstructorApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export enum CourseCategoryEnum {
  PROGRAMMING = "programming",
  DESIGN = "design",
  BUSINESS = "business",
  MARKETING = "marketing",
  MUSIC = "music",
  PHOTOGRAPHY = "photography",
  HEALTH = "health",
  FITNESS = "fitness",
  LANGUAGE = "language",
  OTHER = "other"
}