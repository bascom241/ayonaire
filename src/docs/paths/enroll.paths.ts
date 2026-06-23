const enrollmentListResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: {
      type: "array",
      items: { $ref: "#/components/schemas/Enrollment" },
    },
  },
};

export default {
  "/api/v1/enrollment/enrolled-courses": {
    get: {
      tags: ["Enrollment"],
      summary: "Get enrolled courses",
      description: "Retrieves all courses the authenticated user is enrolled in.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Enrolled courses retrieved successfully",
          content: {
            "application/json": {
              schema: enrollmentListResponse,
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },

  "/api/v1/enrollment/enrolled-coures": {
    get: {
      tags: ["Enrollment"],
      summary: "Get enrolled courses - deprecated legacy route",
      description:
        "Legacy misspelled route kept for backward compatibility. Use /api/v1/enrollment/enrolled-courses instead.",
      deprecated: true,
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Enrolled courses retrieved successfully",
          content: {
            "application/json": {
              schema: enrollmentListResponse,
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },

  "/api/v1/enrollment/completed-courses": {
    get: {
      tags: ["Enrollment"],
      summary: "Get completed courses",
      description: "Retrieves all courses the authenticated user has completed.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Completed courses retrieved successfully",
          content: {
            "application/json": {
              schema: enrollmentListResponse,
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },
};
