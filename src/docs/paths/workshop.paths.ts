export default {
  "/api/v1/workshop": {
    post: {
      tags: ["Workshops"],
      summary: "Create a workshop",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                platform: { type: "string" },
                status: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Workshop created successfully" }
      }
    }
  }
};
