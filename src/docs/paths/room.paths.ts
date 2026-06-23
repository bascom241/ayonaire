export default {
  "/api/v1/room": {
    post: {
      tags: ["Rooms"],
      summary: "Create room",
      description: "Creates a chat room for the authenticated user.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name", "description"],
              properties: {
                name: { type: "string", example: "Frontend Cohort Room" },
                description: {
                  type: "string",
                  example: "Room for cohort announcements and discussions",
                },
                profile: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Room created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      userId: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string" },
                      profile: {
                        type: "object",
                        properties: {
                          url: { type: "string" },
                          publicId: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
};
