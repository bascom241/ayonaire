export default {
    "/api/v1/room": {
        post: {
            tags: ["Rooms"],
            summary: "Create room",
            description: "Creates a chat room for the authenticated user.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["name", "description"],
                            properties: {
                                name: { type: "string", example: "Frontend Cohort Room" },
                                description: {
                                    type: "string",
                                    example: "Room for cohort announcements and discussions",
                                },
                                profile: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Room created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: {
                                        type: "object",
                                        properties: {
                                            userId: { type: "string" },
                                            name: { type: "string" },
                                            description: { type: "string" },
                                            profile: {
                                                type: "object",
                                                properties: {
                                                    url: { type: "string" },
                                                    publicId: { type: "string" },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
        get: {
            tags: ["Rooms"],
            summary: "Get my rooms",
            description: "Returns all rooms (group and DM) the authenticated user belongs to.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Rooms retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: { type: "array", items: { type: "object" } },
                                },
                            },
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
    "/api/v1/room/dm": {
        post: {
            tags: ["Rooms"],
            summary: "Create or get a direct message room",
            description: "Finds an existing DM room between the authenticated user and another user, or creates one.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["otherUserId"],
                            properties: {
                                otherUserId: {
                                    type: "string",
                                    example: "661f2a8c9c1234567890abcd",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "DM room retrieved or created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    data: { type: "object" },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
};
