export default {
  "/api/v1/feed": {
    post: {
      tags: ["Feeds"],
      summary: "Create a feed",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                content: { type: "string" },
                media: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: {
        201: { description: "Feed created successfully" }
      }
    },
    get: {
      tags: ["Feeds"],
      summary: "Get all feeds",
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Successful response" }
      }
    },
    put: {
      tags: ["Feeds"],
      summary: "Edit a feed",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                feedId: { type: "string" },
                content: { type: "string" },
                media: { type: "string", format: "binary" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Feed updated successfully" }
      }
    },
    delete: {
      tags: ["Feeds"],
      summary: "Delete a feed",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                feedId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Feed deleted successfully" }
      }
    }
  },
  "/api/v1/feed/like": {
    post: {
      tags: ["Feeds"],
      summary: "Like a feed",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                feedId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Feed liked successfully" }
      }
    }
  },
  "/api/v1/feed/comment": {
    post: {
      tags: ["Feeds"],
      summary: "Comment on a feed",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                feedId: { type: "string" },
                text: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Commented successfully" }
      }
    },
    delete: {
      tags: ["Feeds"],
      summary: "Delete a comment",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                feedId: { type: "string" },
                commentId: { type: "string" }
              }
            }
          }
        }
      },
      responses: {
        200: { description: "Comment deleted successfully" }
      }
    }
  }
};
