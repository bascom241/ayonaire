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

  "/api/v1/enrollment/admin/all": {
    get: {
      tags: ["Enrollment"],
      summary: "Get all enrollments",
      description: "Returns paginated enrollments across the platform. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "number", default: 1 } },
        { in: "query", name: "limit", schema: { type: "number", default: 10 } },
      ],
      responses: {
        200: {
          description: "Enrollments retrieved successfully",
          content: {
            "application/json": {
              schema: enrollmentListResponse,
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/enrollment/admin/enroll": {
    post: {
      tags: ["Enrollment"],
      summary: "Bulk enroll students",
      description: "Enrolls a list of student IDs into a course. Admin only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseId", "studentIds"],
              properties: {
                courseId: { type: "string" },
                studentIds: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Enrollment processed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Enrollment processed" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/enrollment/admin/enroll-csv": {
    post: {
      tags: ["Enrollment"],
      summary: "Bulk enroll students via CSV",
      description:
        "Uploads a CSV of student emails and enrolls them into a course. Admin only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["courseId", "file"],
              properties: {
                courseId: { type: "string" },
                file: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Enrollment processed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Enrollment processed" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/enrollment/course/{courseId}": {
    get: {
      tags: ["Enrollment"],
      summary: "Get enrolled course detail",
      description:
        "Returns the authenticated user's enrollment and progress detail for a specific course.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "courseId",
          required: true,
          schema: { type: "string" },
          description: "Course ID",
        },
      ],
      responses: {
        200: {
          description: "Course detail retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Enrollment" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
