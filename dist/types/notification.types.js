export var NotificationType;
(function (NotificationType) {
    NotificationType["REMINDER"] = "reminder";
    NotificationType["EMAIL"] = "email";
    NotificationType["BOTH"] = "both";
})(NotificationType || (NotificationType = {}));
export var NotificationRecipientType;
(function (NotificationRecipientType) {
    NotificationRecipientType["ALL"] = "all";
    NotificationRecipientType["STUDENTS"] = "students";
    NotificationRecipientType["INSTRUCTORS"] = "instructors";
    NotificationRecipientType["SPECIFIC_USERS"] = "specific-users";
})(NotificationRecipientType || (NotificationRecipientType = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "in-app";
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["BOTH"] = "both";
})(NotificationChannel || (NotificationChannel = {}));
export var NotificationSendOption;
(function (NotificationSendOption) {
    NotificationSendOption["NOW"] = "now";
    NotificationSendOption["SCHEDULE"] = "schedule";
    NotificationSendOption["RECURRING"] = "recurring";
})(NotificationSendOption || (NotificationSendOption = {}));
export var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["DRAFT"] = "draft";
    NotificationStatus["SCHEDULED"] = "scheduled";
    NotificationStatus["SENT"] = "sent";
})(NotificationStatus || (NotificationStatus = {}));
