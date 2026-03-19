export default {
  "/api/v1/enroll/enrolled-coures": {
    get: {
      tags: ["Enrollment"],
      summary: "Get enrolled courses",
      description: "Retrieves all courses the authenticated user is enrolled in",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Enrolled courses retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  count: { type: "number" },
                  enrollments: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Enrollment" }
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" }
      }
    }
  }
};