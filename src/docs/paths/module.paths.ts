export default {
  "/api/v1/module/create": {
    post: {
      tags: ["Modules"],
      summary: "Create module",
      description: "Creates a new module for a course (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "description", "course", "order"],
              properties: {
                title: { type: "string", example: "Chapter 1: Introduction" },
                description: { type: "string", example: "Basic concepts" },
                course: { type: "string", description: "Course ID" },
                order: { type: "number", example: 1 }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Module created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Module created successfully" },
                  module: { $ref: "#/components/schemas/Module" }
                }
              }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" }
      }
    }
  }
};