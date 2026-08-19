export default {
    "/api/v1/course/all": {
        get: {
            tags: ["Courses"],
            summary: "Get all published courses",
            description: "Returns all publicly listed courses.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Courses retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Course" },
                                    },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
    "/api/v1/course/cat": {
        get: {
            tags: ["Courses"],
            summary: "Get course categories",
            description: "Returns all course categories.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Categories retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/CourseCategory" },
                                    },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
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
                                    enum: [
                                        "programming",
                                        "design",
                                        "business",
                                        "marketing",
                                        "music",
                                        "photography",
                                        "health",
                                        "fitness",
                                        "language",
                                        "other",
                                    ],
                                },
                            },
                        },
                    },
                },
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
                                    category: { $ref: "#/components/schemas/CourseCategory" },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
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
                                title: {
                                    type: "string",
                                    example: "Introduction to Programming",
                                },
                                description: {
                                    type: "string",
                                    example: "Learn programming basics",
                                },
                                category: { type: "string", description: "Category ID" },
                                price: { type: "number", example: 99.99 },
                                courseLevel: {
                                    type: "string",
                                    enum: ["beginner", "intermediate", "advanced"],
                                    default: "beginner",
                                },
                                thumbnail: {
                                    type: "string",
                                    format: "binary",
                                    description: "Course thumbnail image",
                                },
                                introVideo: {
                                    type: "string",
                                    format: "binary",
                                    description: "Optional course intro video",
                                },
                            },
                        },
                    },
                },
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
                                    message: {
                                        type: "string",
                                        example: "Course created successfully",
                                    },
                                    course: { $ref: "#/components/schemas/Course" },
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
    "/api/v1/course/edit": {
        put: {
            tags: ["Courses"],
            summary: "Edit a course",
            description: "Updates an existing course (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "courseId",
                    required: true,
                    schema: { type: "string" },
                    description: "Course ID to update",
                },
            ],
            requestBody: {
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                category: { type: "string" },
                                price: { type: "number" },
                                courseLevel: {
                                    type: "string",
                                    enum: ["beginner", "intermediate", "advanced"],
                                },
                                status: {
                                    type: "string",
                                    enum: ["draft", "published", "archived"],
                                },
                                thumbnail: {
                                    type: "string",
                                    format: "binary",
                                    description: "New course thumbnail image",
                                },
                                introVideo: {
                                    type: "string",
                                    format: "binary",
                                    description: "New optional course intro video",
                                },
                            },
                        },
                    },
                },
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
                                    message: {
                                        type: "string",
                                        example: "Course updated successfully",
                                    },
                                    course: { $ref: "#/components/schemas/Course" },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/course/assign": {
        put: {
            tags: ["Courses"],
            summary: "Assign instructor to course",
            description: "Assigns an instructor to a course (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "courseId",
                    required: true,
                    schema: { type: "string" },
                    description: "Course ID",
                },
                {
                    in: "query",
                    name: "instructorId",
                    required: true,
                    schema: { type: "string" },
                    description: "Instructor user ID",
                },
            ],
            responses: {
                200: {
                    description: "Instructor assigned successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: {
                                        type: "string",
                                        example: "Instructor assigned successfully",
                                    },
                                    course: { $ref: "#/components/schemas/Course" },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/course/save-to-draft": {
        put: {
            tags: ["Courses"],
            summary: "Save course as draft",
            description: "Creates a draft course. Thumbnail is required and introVideo is optional. Admin only.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["title", "thumbnail", "category"],
                            properties: {
                                title: {
                                    type: "string",
                                    example: "Introduction to Programming",
                                },
                                description: { type: "string" },
                                category: { type: "string", description: "Category ID" },
                                price: { type: "number", example: 99.99 },
                                instructorId: { type: "string" },
                                courseLevel: {
                                    type: "string",
                                    enum: ["Beginner", "Intermediate", "Advanced"],
                                },
                                thumbnail: { type: "string", format: "binary" },
                                introVideo: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Course saved as draft" },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/course": {
        get: {
            tags: ["Courses"],
            summary: "Get admin courses",
            description: "Returns paginated courses for the admin dashboard. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [
                { in: "query", name: "page", schema: { type: "number", default: 1 } },
                { in: "query", name: "limit", schema: { type: "number", default: 10 } },
            ],
            responses: {
                200: { description: "Courses retrieved successfully" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/course/{courseId}": {
        get: {
            tags: ["Courses"],
            summary: "Get single admin course",
            description: "Returns one course for the admin dashboard. Admin only.",
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
                200: { description: "Course retrieved successfully" },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
        delete: {
            tags: ["Courses"],
            summary: "Delete course",
            description: "Deletes a course (Admin/Instructor only)",
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
                200: { description: "Course deleted successfully" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/course/{courseId}/publish": {
        put: {
            tags: ["Courses"],
            summary: "Toggle course publish status",
            description: "Publishes or unpublishes a course (Admin/Instructor only)",
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
                    description: "Course publish status toggled successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: { $ref: "#/components/schemas/Course" },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
};
