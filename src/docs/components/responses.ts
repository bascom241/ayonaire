export const responses = {
  UnauthorizedError: {
    description: "Access token is missing or invalid",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Unauthorized access" }
          }
        }
      }
    }
  },
  ForbiddenError: {
    description: "Insufficient permissions",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Access forbidden. Admin only." }
          }
        }
      }
    }
  },
  NotFoundError: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Resource not found" }
          }
        }
      }
    }
  },
  ValidationError: {
    description: "Validation error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: { type: "array", items: { type: "string" } }
          }
        }
      }
    }
  },
  BadRequestError: {
    description: "Bad request",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid request parameters" }
          }
        }
      }
    }
  }
};