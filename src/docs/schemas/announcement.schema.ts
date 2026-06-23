export default {
  Announcement: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string" },
      summary: { type: "string" },
      cohortId: { type: "string" },
      courseId: { type: "string" },
      students: { type: "array", items: { type: "string" } },
      createdAt: { type: "string", format: "date-time" },
    },
  },
};
