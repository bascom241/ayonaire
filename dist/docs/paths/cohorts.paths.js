const cohortPaths = {
    "/api/v1/cohort/create": {
        post: {
            tags: ["Cohorts"],
            summary: "Create a new cohort",
            description: "Creates a new cohort (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "course"],
                            properties: {
                                name: { type: "string", example: "Cohort 2024 A" },
                                course: { type: "string", description: "Course ID" },
                                creator: { type: "string", description: "Instructor ID" },
                                description: { type: "string" },
                                isActive: { type: "boolean", default: true },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Cohort created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: {
                                        type: "string",
                                        example: "Cohort created successfully",
                                    },
                                    cohort: { $ref: "#/components/schemas/Cohort" },
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
    "/api/v1/cohort/assign-student": {
        post: {
            tags: ["Cohorts"],
            summary: "Assign student to cohort",
            description: "Assigns a student to a cohort (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["cohortId", "studentId"],
                            properties: {
                                cohortId: { type: "string" },
                                studentId: { type: "string" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Student assigned successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: {
                                        type: "string",
                                        example: "Student assigned successfully",
                                    },
                                    cohort: { $ref: "#/components/schemas/Cohort" },
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
    "/api/v1/cohort/assign-instrutor": {
        post: {
            tags: ["Cohorts"],
            summary: "Assign instructor to cohort",
            description: "Assigns an instructor to a cohort (Admin only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["cohortId", "instructorId"],
                            properties: {
                                cohortId: { type: "string" },
                                instructorId: { type: "string" },
                            },
                        },
                    },
                },
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
                                    message: {
                                        type: "string",
                                        example: "Instructor assigned successfully",
                                    },
                                    cohort: { $ref: "#/components/schemas/Cohort" },
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
    "/api/v1/cohort": {
        get: {
            tags: ["Cohorts"],
            summary: "Get all cohorts",
            description: "Returns cohorts visible to the authenticated user (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                { in: "query", name: "page", schema: { type: "number", default: 1 } },
                { in: "query", name: "limit", schema: { type: "number", default: 10 } },
            ],
            responses: {
                200: {
                    description: "Cohorts retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Cohort" },
                                    },
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
    "/api/v1/cohort/{cohortId}": {
        get: {
            tags: ["Cohorts"],
            summary: "Get single cohort",
            description: "Returns one cohort by ID (Admin/Instructor only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "cohortId",
                    required: true,
                    schema: { type: "string" },
                    description: "Cohort ID",
                },
            ],
            responses: {
                200: {
                    description: "Cohort retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: { $ref: "#/components/schemas/Cohort" },
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
export default cohortPaths;
