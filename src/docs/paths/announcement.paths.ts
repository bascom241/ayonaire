export default {
  "/api/v1/announcement": {
    post: {
      tags: ["Announcements"],
      summary: "Create announcement",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "summary"],
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                cohortId: { type: "string" },
                courseId: { type: "string" },
                students: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Announcement created successfully" },
        400: { description: "Bad request" },
      },
    },
    get: {
      tags: ["Announcements"],
      summary: "Get all announcements",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Successful response" },
      },
    },
  },
};
