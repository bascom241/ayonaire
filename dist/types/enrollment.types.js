/* Active*/
/*
This means a student was enrolled in a course maybe by an admin where by the enrollment status by default is Active
At this stage the student cannot view the content of the course.
Active means ---> student has been enrolled but has not yet paid for the course
*/
/* Complted*/
/*
This means a student has may or not be enrolled for the course by the instructor .. once the student pays the enrollment status is changed
to completed --> completed means student has paid fro the course.
*/
export var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["ACTIVE"] = "active";
    EnrollmentStatus["COMPLETED"] = "completed";
    EnrollmentStatus["CANCELLED"] = "cancelled";
})(EnrollmentStatus || (EnrollmentStatus = {}));
