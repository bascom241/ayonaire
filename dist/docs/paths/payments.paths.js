export default {
    "/api/v1/lesson/upload": {
        post: {
            tags: ["Lessons"],
            summary: "Upload lesson",
            description: "Creates a new lesson (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["title", "module", "course", "order"],
                            properties: {
                                title: { type: "string", example: "Variables and Data Types" },
                                module: { type: "string", description: "Module ID" },
                                course: { type: "string", description: "Course ID" },
                                order: { type: "number", example: 1 },
                                duration: { type: "number", example: 600 },
                                isPublished: { type: "boolean", default: false },
                                isFreePreview: { type: "boolean", default: false },
                                isLocked: { type: "boolean", default: true }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Lesson created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Lesson created successfully" },
                                    lesson: { $ref: "#/components/schemas/Lesson" }
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
    "/api/v1/lesson/upload-video": {
        post: {
            tags: ["Lessons"],
            summary: "Upload lesson videos",
            description: "Uploads multiple videos for a lesson (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["lessonId", "videos"],
                            properties: {
                                lessonId: { type: "string", description: "Lesson ID" },
                                videos: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "binary"
                                    },
                                    description: "Video files to upload (max 10)"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Videos uploaded successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Videos uploaded successfully" },
                                    lesson: { $ref: "#/components/schemas/Lesson" }
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
    "/api/v1/lesson/mark-lesson-as-completed": {
        post: {
            tags: ["Lessons"],
            summary: "Mark lesson as completed",
            description: "Marks a lesson as completed by the authenticated user",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["lessonId"],
                            properties: {
                                lessonId: { type: "string" }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Lesson marked as completed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Lesson completed successfully" }
                                }
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                404: { $ref: "#/components/responses/NotFoundError" }
            }
        }
    },
    "/api/v1/lesson/update-last-lesson": {
        post: {
            tags: ["Lessons"],
            summary: "Update last watched lesson",
            description: "Updates the last watched lesson for a user",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["courseId", "lessonId"],
                            properties: {
                                courseId: { type: "string" },
                                lessonId: { type: "string" }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Last lesson updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Last lesson updated successfully" },
                                    enrollment: { $ref: "#/components/schemas/Enrollment" }
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
    "/api/v1/lesson/resume-last-lesson": {
        get: {
            tags: ["Lessons"],
            summary: "Resume last lesson",
            description: "Gets the last watched lesson for a specific course",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "courseId",
                    required: true,
                    schema: { type: "string" },
                    description: "Course ID"
                }
            ],
            responses: {
                200: {
                    description: "Last lesson retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    lesson: { $ref: "#/components/schemas/Lesson" },
                                    enrollment: { $ref: "#/components/schemas/Enrollment" }
                                }
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                404: { $ref: "#/components/responses/NotFoundError" }
            }
        }
    },
    "/api/v1/lesson/view-lesson-content": {
        get: {
            tags: ["Lessons"],
            summary: "View lesson content",
            description: "Retrieves the content of a specific lesson",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "lessonId",
                    required: true,
                    schema: { type: "string" },
                    description: "Lesson ID"
                }
            ],
            responses: {
                200: {
                    description: "Lesson content retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    lesson: { $ref: "#/components/schemas/Lesson" }
                                }
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                404: { $ref: "#/components/responses/NotFoundError" }
            }
        }
    }
};
