export default {
  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "60d21b4667d0d8992e610c85" },
      name: { type: "string", example: "John Doe" },
      email: { type: "string", example: "john@example.com" },
      phoneNumber: { type: "string", example: "+1234567890" },
      password: { type: "string", format: "password" },
      profile: {
        type: "object",
        properties: {
          url: { type: "string", example: "https://example.com/profile.jpg" },
          publicId: { type: "string", example: "profiles/abc123" }
        }
      },
      role: { 
        type: "string", 
        enum: ["user", "instructor", "admin"],
        example: "user"
      },
      status: {
        type: "string",
        enum: ["active", "inactive", "suspended"],
        example: "active"
      },
      cohorts: {
        type: "array",
        items: { type: "string" }
      },
      loginHistory: {
        type: "array",
        items: {
          type: "object",
          properties: {
            ip: { type: "string" },
            userAgent: { type: "string" },
            loggedInAt: { type: "string", format: "date-time" }
          }
        }
      },
      activity: {
        type: "array",
        items: {
          type: "object",
          properties: {
            action: { type: "string" },
            performedAt: { type: "string", format: "date-time" },
            meta: { type: "object" }
          }
        }
      },
      verificationToken: { type: "string" },
      verificationTokenExpiresAt: { type: "string", format: "date-time" },
      resetPasswordToken: { type: "string" },
      resetPasswordTokenExpiresAt: { type: "string", format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  UserRegistration: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", format: "password", example: "password123" },
      phoneNumber: { type: "string", example: "+1234567890" }
    }
  },
  UserLogin: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "john@example.com" },
      password: { type: "string", format: "password", example: "password123" }
    }
  },
  LoginResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
      user: { $ref: "#/components/schemas/User" }
    }
  }
};