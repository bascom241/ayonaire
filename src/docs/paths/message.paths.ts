const messageResponse = {
  type: "object",
  properties: {
    senderId: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    },
    roomId: { type: "string" },
    text: { type: "string" },
    media: {
      type: "object",
      properties: {
        url: { type: "string" },
        publicId: { type: "string" },
      },
    },
    file: {
      type: "object",
      properties: {
        url: { type: "string" },
        publicId: { type: "string" },
      },
    },
  },
};

export default {
  "/api/v1/message/send": {
    post: {
      tags: ["Messages"],
      summary: "Send a room message",
      description: "Sends a text, media, or file message to a room and broadcasts it over Socket.IO.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["roomId"],
              properties: {
                roomId: { type: "string", example: "661f2a8c9c1234567890abcd" },
                text: { type: "string", example: "Hello everyone" },
                file: { type: "string", format: "binary" },
              },
            },
          },
          "application/json": {
            schema: {
              type: "object",
              required: ["roomId"],
              properties: {
                roomId: { type: "string", example: "661f2a8c9c1234567890abcd" },
                text: { type: "string", example: "Hello everyone" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Message sent successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: messageResponse,
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

  "/api/v1/message": {
    get: {
      tags: ["Messages"],
      summary: "Get room messages",
      description: "Returns paginated messages for a room. Current backend expects roomId in the request body.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "number", default: 1 } },
        { in: "query", name: "limit", schema: { type: "number", default: 10 } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["roomId"],
              properties: {
                roomId: { type: "string", example: "661f2a8c9c1234567890abcd" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Messages retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      messages: {
                        type: "array",
                        items: messageResponse,
                      },
                      pagination: { type: "object" },
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
  },
};
