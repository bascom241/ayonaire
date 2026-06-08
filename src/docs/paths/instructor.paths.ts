export default {
  "/api/v1/instructor-management/apply": {
    post: {
      tags: ["Instructor"],
      summary: "Apply to become instructor",
      description: "Submits an application to become an instructor",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["expertise", "instructorCourseCategory"],
              properties: {
                bio: { type: "string" },
                expertise: { 
                  type: "array", 
                  items: { type: "string" },
                  example: ["JavaScript", "React", "Node.js"]
                },
                instructorCourseCategory: { type: "string", description: "Category ID" }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Application submitted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Application submitted successfully" },
                  application: { $ref: "#/components/schemas/Instructor" }
                }
              }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" }
      }
    }
  },

  "/api/v1/instructor-management/approve": {
    post: {
      tags: ["Admin"],
      summary: "Approve instructor application",
      description: "Approves an instructor application (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId"],
              properties: {
                userId: { type: "string", description: "User ID for the instructor application" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Application approved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Instructor approved successfully" },
                  instructor: { $ref: "#/components/schemas/Instructor" }
                }
              }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    }
  },

  "/api/v1/instructor-management/reject": {
    post: {
      tags: ["Admin"],
      summary: "Reject instructor application",
      description: "Rejects an instructor application (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId"],
              properties: {
                userId: { type: "string", description: "User ID for the instructor application" },
                reason: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Application rejected successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Application rejected successfully" }
                }
              }
            }
          }
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    }
  },

  "/api/v1/instructor-management/profile": {
    get: {
      tags: ["Admin"],
      summary: "Get instructor profile",
      description: "Retrieves a specific instructor profile (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId"],
              properties: {
                userId: { type: "string", description: "Instructor user ID" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  instructor: { $ref: "#/components/schemas/Instructor" }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" }
      }
    }
  },

  "/api/v1/instructor-management/profiles": {
    get: {
      tags: ["Admin"],
      summary: "Get all instructor profiles",
      description: "Retrieves all instructor profiles (Admin only)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profiles retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  count: { type: "number" },
                  instructors: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Instructor" }
                  }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" }
      }
    }
  }
};
