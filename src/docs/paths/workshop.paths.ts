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
    },
    get: {
      tags: ["Workshops"],
      summary: "Get all workshops",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number for pagination",
          required: false,
          schema: { type: "integer", default: 1 }
        },
        {
          name: "limit",
          in: "query",
          description: "Number of items per page",
          required: false,
          schema: { type: "integer", default: 10 }
        }
      ],
      responses: {
        200: { description: "Workshops fetched successfully" }
      }
    }
  }
};
