export enum NotificationType {
  REMINDER = "reminder",
  EMAIL = "email",
  BOTH = "both",
}

export enum NotificationRecipientType {
  ALL = "all",
  STUDENTS = "students",
  INSTRUCTORS = "instructors",
  SPECIFIC_USERS = "specific-users",
}

export enum NotificationChannel {
  IN_APP = "in-app",
  EMAIL = "email",
  BOTH = "both",
}

export enum NotificationSendOption {
  NOW = "now",
  SCHEDULE = "schedule",
  RECURRING = "recurring",
}

export enum NotificationStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  SENT = "sent",
}

export interface CreateNotificationRequest {
  name: string;
  message: string;
  type?: string;
  recipientType?: string;
  recipients?: string[];
  course?: string;
  cohort?: string;
  channel?: string;
  sendOption?: string;
  scheduledAt?: string;
  isRecurringTemplate?: boolean;
  status?: string;
}

export interface UpdateNotificationRequest {
  name?: string;
  message?: string;
  status?: string;
  scheduledAt?: string;
}
