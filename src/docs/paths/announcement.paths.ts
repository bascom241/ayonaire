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

  "/api/v1/announcement/{announcementId}": {
    put: {
      tags: ["Announcements"],
      summary: "Update announcement",
      description:
        "Updates an announcement's title, summary, status, or schedule (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "announcementId",
          required: true,
          schema: { type: "string" },
          description: "Announcement ID",
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                status: { type: "string" },
                scheduledAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Announcement updated successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Announcements"],
      summary: "Delete announcement",
      description: "Deletes an announcement (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "announcementId",
          required: true,
          schema: { type: "string" },
          description: "Announcement ID",
        },
      ],
      responses: {
        200: { description: "Announcement deleted successfully" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
