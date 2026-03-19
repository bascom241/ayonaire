export const parameters = {
  userIdParam: {
    in: "path",
    name: "id",
    required: true,
    schema: { type: "string" },
    description: "User ID"
  },
  courseIdParam: {
    in: "query",
    name: "courseId",
    required: true,
    schema: { type: "string" },
    description: "Course ID"
  },
  lessonIdParam: {
    in: "query",
    name: "lessonId",
    required: true,
    schema: { type: "string" },
    description: "Lesson ID"
  },
  cohortIdParam: {
    in: "query",
    name: "cohortId",
    required: true,
    schema: { type: "string" },
    description: "Cohort ID"
  },
  applicationIdParam: {
    in: "query",
    name: "applicationId",
    required: true,
    schema: { type: "string" },
    description: "Instructor application ID"
  },
  instructorIdParam: {
    in: "query",
    name: "instructorId",
    required: true,
    schema: { type: "string" },
    description: "Instructor ID"
  },
  quizIdParam: {
    in: "query",
    name: "quizId",
    required: true,
    schema: { type: "string" },
    description: "Quiz ID"
  }
};