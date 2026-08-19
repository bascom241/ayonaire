export default {
    "/api/v1/workshop": {
        post: {
            tags: ["Workshops"],
            summary: "Create a workshop",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                platform: { type: "string" },
                                status: { type: "string" },
                                startDate: { type: "string", format: "date-time" },
                                endDate: { type: "string", format: "date-time" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Workshop created successfully" },
            },
        },
        get: {
            tags: ["Workshops"],
            summary: "Get all workshops",
            security: [],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    description: "Page number for pagination",
                    required: false,
                    schema: { type: "integer", default: 1 },
                },
                {
                    name: "limit",
                    in: "query",
                    description: "Number of items per page",
                    required: false,
                    schema: { type: "integer", default: 10 },
                },
            ],
            responses: {
                200: { description: "Workshops fetched successfully" },
            },
        },
    },
    "/api/v1/workshop/{id}": {
        get: {
            tags: ["Workshops"],
            summary: "Get single workshop",
            description: "Returns one workshop by ID.",
            security: [],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Workshop ID",
                },
            ],
            responses: {
                200: { description: "Workshop fetched successfully" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
        delete: {
            tags: ["Workshops"],
            summary: "Delete a workshop",
            description: "Deletes an existing workshop. Admin/Instructor only.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Workshop ID",
                },
            ],
            responses: {
                200: { description: "Workshop deleted successfully" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
        put: {
            tags: ["Workshops"],
            summary: "Edit a workshop",
            description: "Updates an existing workshop. Admin/Instructor only.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Workshop ID",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                platform: {
                                    type: "object",
                                    properties: {
                                        type: { type: "string" },
                                        name: { type: "string" },
                                        link: { type: "string" },
                                    },
                                },
                                status: { type: "string" },
                                startDate: { type: "string", format: "date-time" },
                                endDate: { type: "string", format: "date-time" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Workshop updated successfully" },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
};
