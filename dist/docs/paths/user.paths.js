const authEnvelope = (data) => ({
    type: "object",
    properties: {
        success: { type: "boolean", example: true },
        data,
    },
});
const userResponse = {
    type: "object",
    properties: {
        _id: { type: "string", example: "661f2a8c9c1234567890abcd" },
        name: { type: "string", example: "John Doe" },
        email: { type: "string", format: "email", example: "john@example.com" },
        status: { type: "string", example: "active" },
        createdAt: { type: "string", format: "date-time" },
    },
};
const inviteResult = {
    type: "object",
    properties: {
        message: { type: "string", example: "Invites Process completed" },
        sent: {
            type: "array",
            items: { type: "string", format: "email" },
        },
        skipped: {
            type: "array",
            items: { type: "string", format: "email" },
        },
    },
};
const userIdParam = {
    in: "path",
    name: "id",
    required: true,
    schema: { type: "string" },
    description: "User ID",
};
const tokenPairResponse = {
    type: "object",
    properties: {
        token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIs...",
            description: "Access JWT kept for backward compatibility. Same value as accessToken.",
        },
        accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIs...",
            description: "Short-lived JWT. Send as Authorization: Bearer <accessToken>.",
        },
        refreshToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIs...",
            description: "Long-lived refresh token. Store securely and send to /refresh-token.",
        },
        expiresIn: {
            type: "number",
            example: 900,
            description: "Access-token lifetime in seconds.",
        },
        user: {
            type: "object",
            properties: {
                id: { type: "string", example: "661f2a8c9c1234567890abcd" },
                name: { type: "string", example: "John Doe" },
                email: { type: "string", format: "email", example: "john@example.com" },
                role: { type: "string", example: "user" },
                status: { type: "string", example: "active" },
            },
        },
    },
};
export default {
    "/api/v1/auth/register": {
        post: {
            tags: ["Users"],
            summary: "Register a new user",
            description: "Creates a user account. The backend hashes the password before saving it.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserRegistration" },
                    },
                },
            },
            responses: {
                201: {
                    description: "User created successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(userResponse),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                409: { description: "User already exists" },
            },
        },
    },
    "/api/v1/auth/verify-email": {
        get: {
            tags: ["Auth"],
            summary: "Verify email address",
            description: "Verifies a newly registered user's email address using the token sent by Brevo.",
            security: [],
            parameters: [
                {
                    in: "query",
                    name: "token",
                    required: true,
                    schema: { type: "string" },
                    description: "Email verification token",
                },
            ],
            responses: {
                200: {
                    description: "Email verified successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Email verified successfully" },
                                },
                            },
                        },
                    },
                },
                400: { description: "Invalid or expired verification token" },
            },
        },
        post: {
            tags: ["Auth"],
            summary: "Verify email address",
            description: "Verifies a user's email address using a token in the JSON body.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["token"],
                            properties: {
                                token: { type: "string" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Email verified successfully" },
                400: { description: "Invalid or expired verification token" },
            },
        },
    },
    "/api/v1/auth/resend-verification-email": {
        post: {
            tags: ["Auth"],
            summary: "Resend verification email",
            description: "Sends a new email verification link through Brevo if the account exists and is not verified.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email"],
                            properties: {
                                email: { type: "string", format: "email", example: "john@example.com" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Verification email response",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: {
                                        type: "string",
                                        example: "If an account exists, a verification email has been sent",
                                    },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
            },
        },
    },
    "/api/v1/auth/forgot-password": {
        post: {
            tags: ["Auth"],
            summary: "Request password reset",
            description: "Generates a password reset token and sends a reset link through Brevo.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email"],
                            properties: {
                                email: { type: "string", format: "email", example: "john@example.com" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Password reset email response",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: {
                                        type: "string",
                                        example: "If an account exists, a password reset email has been sent",
                                    },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
            },
        },
    },
    "/api/v1/auth/reset-password": {
        post: {
            tags: ["Auth"],
            summary: "Reset password",
            description: "Sets a new password using a valid password reset token. Existing refresh sessions are revoked after reset.",
            security: [],
            parameters: [
                {
                    in: "query",
                    name: "token",
                    required: false,
                    schema: { type: "string" },
                    description: "Password reset token. Can also be sent in the JSON body.",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["password"],
                            properties: {
                                token: { type: "string" },
                                password: { type: "string", format: "password", example: "NewStrongPassword123" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Password reset successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Password reset successfully" },
                                },
                            },
                        },
                    },
                },
                400: { description: "Invalid or expired reset token or validation error" },
            },
        },
    },
    "/api/v1/auth/login": {
        post: {
            tags: ["Auth"],
            summary: "Login a user",
            description: "Authenticates a user, returns a short-lived access token and a persisted refresh token session. Suspended and inactive accounts cannot login.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UserLogin" },
                    },
                },
            },
            responses: {
                200: {
                    description: "Login successful",
                    content: {
                        "application/json": {
                            schema: authEnvelope(tokenPairResponse),
                        },
                    },
                },
                401: { description: "Invalid credentials" },
                403: { description: "Account suspended or inactive" },
                404: { description: "User not found" },
            },
        },
    },
    "/api/v1/auth/refresh-token": {
        post: {
            tags: ["Auth"],
            summary: "Refresh authentication tokens",
            description: "Validates the refresh token, revokes it, creates a new refresh session, and returns a new access/refresh token pair. Reuse of a revoked refresh token revokes all active sessions for that user.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["refreshToken"],
                            properties: {
                                refreshToken: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIs...",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Tokens refreshed successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(tokenPairResponse),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { description: "Invalid, expired, missing, or revoked refresh token" },
                403: { description: "Account suspended or inactive" },
            },
        },
    },
    "/api/v1/auth/logout": {
        post: {
            tags: ["Auth"],
            summary: "Logout user",
            description: "Revokes the provided refresh token. Set allDevices to true to revoke all refresh sessions for the same user. Access tokens remain valid until expiry, so frontend should clear stored tokens immediately.",
            security: [],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                refreshToken: {
                                    type: "string",
                                    example: "eyJhbGciOiJIUzI1NiIs...",
                                },
                                allDevices: {
                                    type: "boolean",
                                    example: false,
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Logout successful",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "logged out" },
                                },
                            },
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { description: "Unauthorized" },
            },
        },
    },
    "/api/v1/auth/non-admin-users": {
        get: {
            tags: ["Admin"],
            summary: "Get all non-admin users",
            description: "Retrieves all users except admins. Admin only.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Users retrieved successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope({
                                type: "array",
                                items: userResponse,
                            }),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/auth/user/{id}": {
        put: {
            tags: ["Admin"],
            summary: "Update user",
            description: "Updates user information. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                email: { type: "string", format: "email", example: "john@example.com" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "User updated successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(userResponse),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/auth/user/{id}/login-history": {
        get: {
            tags: ["Admin"],
            summary: "Get user login history",
            description: "Retrieves login history for a specific user. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            responses: {
                200: {
                    description: "Login history retrieved",
                    content: {
                        "application/json": {
                            schema: authEnvelope({
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        ip: { type: "string", example: "::1" },
                                        userAgent: { type: "string" },
                                        loggedInAt: { type: "string", format: "date-time" },
                                    },
                                },
                            }),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/auth/user/{id}/user-activity-history": {
        get: {
            tags: ["Admin"],
            summary: "Get user activity history",
            description: "Retrieves activity history for a specific user. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            responses: {
                200: {
                    description: "Activity history retrieved",
                    content: {
                        "application/json": {
                            schema: authEnvelope({
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        action: { type: "string", example: "LOGIN" },
                                        performedAt: { type: "string", format: "date-time" },
                                        meta: { type: "object" },
                                    },
                                },
                            }),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/auth/user/{id}/assign-role": {
        put: {
            tags: ["Admin"],
            summary: "Assign role to user",
            description: "Assigns a new role to a user. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
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
                                    example: "instructor",
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Role assigned successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope({ type: "string", example: "role INSTRUCTOR assinged to John Doe" }),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
                404: { $ref: "#/components/responses/NotFoundError" },
            },
        },
    },
    "/api/v1/auth/user/{id}/deactivate-user": {
        put: {
            tags: ["Admin"],
            summary: "Deactivate user",
            description: "Deactivates a user account. Admin only. The legacy misspelled route /api/v1/auth/user/{id}/deativate-user is still available for backward compatibility.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            responses: {
                200: {
                    description: "User deactivated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "user deactivated" },
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
    "/api/v1/auth/user/{id}/deativate-user": {
        put: {
            tags: ["Admin"],
            summary: "Deactivate user - deprecated legacy route",
            description: "Legacy misspelled route kept for backward compatibility. Use /api/v1/auth/user/{id}/deactivate-user instead.",
            deprecated: true,
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            responses: {
                200: {
                    description: "User deactivated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "user deactivated" },
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
    "/api/v1/auth/user/{id}/suspend-user": {
        put: {
            tags: ["Admin"],
            summary: "Suspend user",
            description: "Suspends a user account. Admin only.",
            security: [{ bearerAuth: [] }],
            parameters: [userIdParam],
            responses: {
                200: {
                    description: "User suspended successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "user suspended" },
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
    "/api/v1/auth/get-profile": {
        post: {
            tags: ["Users"],
            summary: "View my profile",
            description: "Retrieves the profile of the authenticated user.",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Profile retrieved successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(userResponse),
                        },
                    },
                },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
    "/api/v1/auth/add-profile": {
        post: {
            tags: ["Users"],
            summary: "Upload profile image",
            description: "Uploads or replaces the profile image for the authenticated user.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["profile"],
                            properties: {
                                profile: { type: "string", format: "binary" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Profile image uploaded successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope({
                                type: "object",
                                properties: {
                                    profile: {
                                        type: "object",
                                        properties: {
                                            url: { type: "string" },
                                            publicId: { type: "string" },
                                        },
                                    },
                                },
                            }),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
    "/api/v1/auth/edit-profile": {
        put: {
            tags: ["Users"],
            summary: "Edit profile",
            description: "Updates the authenticated user's name and profile image.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["profile"],
                            properties: {
                                profile: { type: "string", format: "binary" },
                                name: { type: "string", example: "John Doe" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Profile updated successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope({
                                type: "object",
                                properties: {
                                    name: { type: "string", example: "John Doe" },
                                    profile: {
                                        type: "object",
                                        properties: {
                                            url: { type: "string" },
                                            publicId: { type: "string" },
                                        },
                                    },
                                },
                            }),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
            },
        },
    },
    "/api/v1/auth/add": {
        post: {
            tags: ["Admin"],
            summary: "Add new user",
            description: "Creates a new user manually. Admin only.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "email", "password"],
                            properties: {
                                name: { type: "string", example: "Jane Student" },
                                email: { type: "string", format: "email", example: "jane@example.com" },
                                password: { type: "string", format: "password", example: "StrongPassword123" },
                                role: { type: "string", enum: ["user", "instructor", "admin"], example: "user" },
                                status: { type: "string", enum: ["active", "inactive", "suspended"], example: "active" },
                                courseId: { type: "string", example: "661f2a8c9c1234567890abcd" },
                                cohortId: { type: "string", example: "661f2b1d9c1234567890efgh" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "User created successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(userResponse),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/auth/invite": {
        post: {
            tags: ["Admin"],
            summary: "Invite users",
            description: "Invites multiple users by email. Admin only.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["emails", "courseId", "cohortId"],
                            properties: {
                                emails: {
                                    type: "array",
                                    items: { type: "string", format: "email" },
                                    example: ["student@example.com"],
                                },
                                courseId: { type: "string", example: "661f2a8c9c1234567890abcd" },
                                cohortId: { type: "string", example: "661f2b1d9c1234567890efgh" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Invites processed successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(inviteResult),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/auth/invite/csv": {
        post: {
            tags: ["Admin"],
            summary: "Bulk invite users via CSV",
            description: "Uploads a CSV with an email column and sends invites. Admin only.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            required: ["file", "courseId", "cohortId"],
                            properties: {
                                file: { type: "string", format: "binary" },
                                courseId: { type: "string", example: "661f2a8c9c1234567890abcd" },
                                cohortId: { type: "string", example: "661f2b1d9c1234567890efgh" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "CSV processed successfully",
                    content: {
                        "application/json": {
                            schema: authEnvelope(inviteResult),
                        },
                    },
                },
                400: { $ref: "#/components/responses/ValidationError" },
                401: { $ref: "#/components/responses/UnauthorizedError" },
                403: { $ref: "#/components/responses/ForbiddenError" },
            },
        },
    },
    "/api/v1/auth/accept-invite/{token}": {
        post: {
            tags: ["Auth"],
            summary: "Accept invite and create account",
            description: "Completes account registration from an invite token.",
            security: [],
            parameters: [
                {
                    name: "token",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Invite token sent by email",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "password"],
                            properties: {
                                name: { type: "string", example: "John Doe" },
                                password: { type: "string", format: "password", example: "StrongPassword123" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Invite accepted successfully and user created",
                    content: {
                        "application/json": {
                            schema: authEnvelope(userResponse),
                        },
                    },
                },
                400: { description: "Invalid or expired token or validation error" },
                404: { description: "Invite or user resource not found" },
            },
        },
    },
};
