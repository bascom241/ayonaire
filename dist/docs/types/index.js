export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["INSTRUCTOR"] = "instructor";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
export var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
})(UserStatus || (UserStatus = {}));
export var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "draft";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["ARCHIVED"] = "archived";
})(CourseStatus || (CourseStatus = {}));
export var CourseLevel;
(function (CourseLevel) {
    CourseLevel["BEGINNER"] = "beginner";
    CourseLevel["INTERMEDIATE"] = "intermediate";
    CourseLevel["ADVANCED"] = "advanced";
})(CourseLevel || (CourseLevel = {}));
export var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["COMPLETED"] = "completed";
    EnrollmentStatus["DROPPED"] = "dropped";
})(EnrollmentStatus || (EnrollmentStatus = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESSFUL"] = "successful";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (PaymentStatus = {}));
export var InstructorApplicationStatus;
(function (InstructorApplicationStatus) {
    InstructorApplicationStatus["PENDING"] = "pending";
    InstructorApplicationStatus["APPROVED"] = "approved";
    InstructorApplicationStatus["REJECTED"] = "rejected";
})(InstructorApplicationStatus || (InstructorApplicationStatus = {}));
export var CourseCategoryEnum;
(function (CourseCategoryEnum) {
    CourseCategoryEnum["PROGRAMMING"] = "programming";
    CourseCategoryEnum["DESIGN"] = "design";
    CourseCategoryEnum["BUSINESS"] = "business";
    CourseCategoryEnum["MARKETING"] = "marketing";
    CourseCategoryEnum["MUSIC"] = "music";
    CourseCategoryEnum["PHOTOGRAPHY"] = "photography";
    CourseCategoryEnum["HEALTH"] = "health";
    CourseCategoryEnum["FITNESS"] = "fitness";
    CourseCategoryEnum["LANGUAGE"] = "language";
    CourseCategoryEnum["OTHER"] = "other";
})(CourseCategoryEnum || (CourseCategoryEnum = {}));
