export default {
    "/api/v1/user/register": {
        post: {
            tags: ["Users"],
            summary: "Register a new user",
            description: "Creates a new user account",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "email", "password"],
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                email: { type: "string", format: "email", example: "john@example.com" },
                                password: { type: "string", format: "password", example: "password123" },
                                phoneNumber: { type: "string", example: "+1234567890" }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "User created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "User created successfully" },
                                    user: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/ValidationError" }
            }
        }
    },
    "/api/v1/user/login": {
        post: {
            tags: ["Users"],
            summary: "Login a user",
            description: "Authenticates a user and returns a JWT token",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email", "password"],
                            properties: {
                                email: { type: "string", format: "email", example: "john@example.com" },
                                password: { type: "string", format: "password", example: "password123" }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login successful",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                                    user: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Invalid credentials",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Invalid email or password" }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/api/v1/user/non-admin-users": {
        get: {
            tags: ["Admin"],
            summary: "Get all non-admin users",
            description: "Retrieves all users except admins (Admin only)",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Users retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    count: { type: "number" },
                                    users: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/User" }
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
    },
    "/api/v1/user/{id}": {
        put: {
            tags: ["Admin"],
            summary: "Update user",
            description: "Updates user information (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                email: { type: "string", format: "email" },
                                phoneNumber: { type: "string" },
                                role: { type: "string", enum: ["user", "instructor", "admin"] }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "User updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    user: { $ref: "#/components/schemas/User" }
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
    "/api/v1/user/{id}/login-history": {
        get: {
            tags: ["Admin"],
            summary: "Get user login history",
            description: "Retrieves login history for a specific user (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            responses: {
                200: {
                    description: "Login history retrieved",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    history: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                ip: { type: "string" },
                                                userAgent: { type: "string" },
                                                loggedInAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    }
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
    "/api/v1/user/{id}/user-activity-history": {
        get: {
            tags: ["Admin"],
            summary: "Get user activity history",
            description: "Retrieves activity history for a specific user (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            responses: {
                200: {
                    description: "Activity history retrieved",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    activities: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                action: { type: "string" },
                                                performedAt: { type: "string", format: "date-time" },
                                                meta: { type: "object" }
                                            }
                                        }
                                    }
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
    "/api/v1/user/{id}/assign-role": {
        put: {
            tags: ["Admin"],
            summary: "Assign role to user",
            description: "Assigns a new role to a user (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["role"],
                            properties: {
                                role: {
                                    type: "string",
                                    enum: ["user", "instructor", "admin"],
                                    example: "instructor"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Role assigned successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Role assigned successfully" },
                                    user: { $ref: "#/components/schemas/User" }
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
    "/api/v1/user/{id}/deativate-user": {
        put: {
            tags: ["Admin"],
            summary: "Deactivate user",
            description: "Deactivates a user account (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            responses: {
                200: {
                    description: "User deactivated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "User deactivated successfully" }
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
    "/api/v1/user/{id}/suspend-user": {
        put: {
            tags: ["Admin"],
            summary: "Suspend user",
            description: "Suspends a user account (Admin only)",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID"
                }
            ],
            responses: {
                200: {
                    description: "User suspended successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "User suspended successfully" }
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
    "/api/v1/user/get-profile": {
        post: {
            tags: ["Users"],
            summary: "View my profile",
            description: "Retrieves the profile of the authenticated user",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Profile retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    user: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                },
                401: { $ref: "#/components/responses/UnauthorizedError" }
            }
        }
    },
    "/api/v1/user/add-profile": {
        post: {
            tags: ["Users"],
            summary: "Upload profile image",
            description: "Uploads a profile image for the authenticated user",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["profile"],
                            properties: {
                                profile: {
                                    type: "string",
                                    format: "binary",
                                    description: "Profile image file"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Profile image uploaded successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Profile image uploaded successfully" },
                                    profile: {
                                        type: "object",
                                        properties: {
                                            url: { type: "string" },
                                            publicId: { type: "string" }
                                        }
                                    }
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
    "/api/v1/user/edit-profile": {
        put: {
            tags: ["Users"],
            summary: "Edit profile",
            description: "Updates the profile of the authenticated user",
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: {
                                profile: {
                                    type: "string",
                                    format: "binary",
                                    description: "New profile image"
                                },
                                name: { type: "string" },
                                phoneNumber: { type: "string" }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Profile updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Profile updated successfully" },
                                    user: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                },
                401: { $ref: "#/components/responses/UnauthorizedError" }
            }
        }
    },
    "/api/v1/user/add": {
        post: {
            tags: ["Admin"],
            summary: "Add new user (Admin)",
            description: "Creates a new user (Admin only)",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "email", "password", "role"],
                            properties: {
                                name: { type: "string" },
                                email: { type: "string", format: "email" },
                                password: { type: "string", format: "password" },
                                phoneNumber: { type: "string" },
                                role: {
                                    type: "string",
                                    enum: ["user", "instructor", "admin"],
                                    example: "user"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "User created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "User created successfully" },
                                    user: { $ref: "#/components/schemas/User" }
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
    }
};
