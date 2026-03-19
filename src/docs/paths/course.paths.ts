export default {
  "/api/v1/course/cat": {
    post: {
      tags: ["Courses"],
      summary: "Create course category",
      description: "Creates a new course category (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: { 
                  type: "string",
                  enum: ["programming", "design", "business", "marketing", "music", "photography", "health", "fitness", "language", "other"]
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Category created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  category: { $ref: "#/components/schemas/CourseCategory" }
                }
              }
            }
          }
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" }
      }
    }
  },

  "/api/v1/course/create": {
    post: {
      tags: ["Courses"],
      summary: "Create a new course",
      description: "Creates a new course (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["title", "thumbnail", "category"],
              properties: {
                title: { type: "string", example: "Introduction to Programming" },
                description: { type: "string", example: "Learn programming basics" },
                category: { type: "string", description: "Category ID" },
                price: { type: "number", example: 99.99 },
                courseLevel: { 
                  type: "string", 
                  enum: ["beginner", "intermediate", "advanced"],
                  default: "beginner"
                },
                thumbnail: {
                  type: "string",
                  format: "binary",
                  description: "Course thumbnail image"
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Course created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course created successfully" },
                  course: { $ref: "#/components/schemas/Course" }
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
  },

  "/api/v1/course/edit": {
    put: {
      tags: ["Courses"],
      summary: "Edit a course",
      description: "Updates an existing course (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                courseId: { type: "string", description: "Course ID to update" },
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                price: { type: "number" },
                courseLevel: { 
                  type: "string", 
                  enum: ["beginner", "intermediate", "advanced"]
                },
                status: {
                  type: "string",
                  enum: ["draft", "published", "archived"]
                },
                thumbnail: {
                  type: "string",
                  format: "binary",
                  description: "New course thumbnail image"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Course updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Course updated successfully" },
                  course: { $ref: "#/components/schemas/Course" }
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

  "/api/v1/course/assign": {
    put: {
      tags: ["Courses"],
      summary: "Assign instructor to course",
      description: "Assigns an instructor to a course (Admin only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseId", "instructorId"],
              properties: {
                courseId: { type: "string" },
                instructorId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Instructor assigned successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Instructor assigned successfully" },
                  course: { $ref: "#/components/schemas/Course" }
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
  }
};