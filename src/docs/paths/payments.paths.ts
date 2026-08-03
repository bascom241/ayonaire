export default {
  "/api/v1/payment/initialize": {
    post: {
      tags: ["Payments"],
      summary: "Initialize payment",
      description:
        "Creates a Paystack payment authorization URL for the authenticated user.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["courseId"],
              properties: {
                courseId: {
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
          description: "Payment initialized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Payment initialized" },
                  data: {
                    type: "string",
                    description: "Paystack authorization URL",
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

  "/api/v1/payment/webhook": {
    post: {
      tags: ["Payments"],
      summary: "Paystack webhook",
      description:
        "Receives Paystack webhook events. Requires x-paystack-signature header.",
      security: [],
      parameters: [
        {
          in: "header",
          name: "x-paystack-signature",
          required: true,
          schema: { type: "string" },
          description: "Paystack HMAC SHA512 signature",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                event: { type: "string", example: "charge.success" },
                data: { type: "object" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Webhook processed" },
        401: { description: "Invalid Paystack signature" },
        500: { description: "Webhook processing failed" },
      },
    },
  },

  "/api/v1/payment/get-all-payments": {
    get: {
      tags: ["Payments"],
      summary: "Get payment history",
      description: "Returns paginated payment/order history. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "number", default: 1 } },
        { in: "query", name: "limit", schema: { type: "number", default: 10 } },
        { in: "query", name: "search", schema: { type: "string" } },
        {
          in: "query",
          name: "order",
          schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
        },
        {
          in: "query",
          name: "sortBy",
          schema: { type: "string", default: "createdAt" },
        },
      ],
      responses: {
        200: {
          description: "Payments retrieved",
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
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/bulk-edit": {
    post: {
      tags: ["Payments"],
      summary: "Bulk edit payment orders",
      description: "Performs bulk order actions. Admin only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                completed: { type: "string" },
                cancelled: { type: "string" },
                revoke: { type: "string" },
                refund: { type: "string" },
                delete: { type: "string" },
                processing: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Bulk action completed" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/edit-order": {
    put: {
      tags: ["Payments"],
      summary: "Edit payment order",
      description:
        "Updates billing and shipping details for an order. Admin only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderId"],
              properties: {
                orderId: { type: "string" },
                billingAddress: { type: "object" },
                shippingAddress: { type: "object" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Order updated" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/single-order/{orderId}": {
    get: {
      tags: ["Payments"],
      summary: "Get single payment order",
      description: "Returns one payment/order by ID. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "orderId",
          required: true,
          schema: { type: "string" },
          description: "Payment order ID",
        },
      ],
      responses: {
        200: { description: "Order retrieved" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  "/api/v1/payment/single-order/{orderId}/notes": {
    post: {
      tags: ["Payments"],
      summary: "Add note to payment order",
      description: "Adds an internal or shared note to an order. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "orderId",
          required: true,
          schema: { type: "string" },
          description: "Payment order ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["content"],
              properties: {
                content: { type: "string" },
                isPrivate: { type: "boolean", default: false },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Note added successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  "/api/v1/payment/analytics": {
    get: {
      tags: ["Payments"],
      summary: "Get payment analytics",
      description: "Returns aggregate payment/revenue analytics. Admin only.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Analytics retrieved successfully",
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
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/student-purchases": {
    get: {
      tags: ["Payments"],
      summary: "Get student purchases",
      description: "Returns paginated purchases grouped by student. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "number", default: 1 } },
        { in: "query", name: "limit", schema: { type: "number", default: 10 } },
      ],
      responses: {
        200: {
          description: "Student purchases retrieved successfully",
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
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/gateways": {
    get: {
      tags: ["Payments"],
      summary: "Get connected payment gateways",
      description: "Lists all configured payment gateways. Admin only.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Gateways retrieved successfully",
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
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
    post: {
      tags: ["Payments"],
      summary: "Connect a payment gateway",
      description: "Connects a new payment gateway. Admin only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "paystack" },
                publicKey: { type: "string" },
                secretKey: { type: "string" },
                isPrimary: { type: "boolean", default: false },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Gateway connected successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/gateways/{name}": {
    put: {
      tags: ["Payments"],
      summary: "Update a payment gateway",
      description: "Updates configuration for a connected gateway. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "name",
          required: true,
          schema: { type: "string" },
          description: "Gateway name",
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                publicKey: { type: "string" },
                secretKey: { type: "string" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Gateway updated successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Payments"],
      summary: "Disconnect a payment gateway",
      description: "Disconnects a payment gateway. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "name",
          required: true,
          schema: { type: "string" },
          description: "Gateway name",
        },
      ],
      responses: {
        200: { description: "Gateway disconnected successfully" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  "/api/v1/payment/gateways/{name}/set-primary": {
    put: {
      tags: ["Payments"],
      summary: "Set primary payment gateway",
      description: "Marks a gateway as the primary one used for checkout. Admin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "name",
          required: true,
          schema: { type: "string" },
          description: "Gateway name",
        },
      ],
      responses: {
        200: { description: "Primary gateway set successfully" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  "/api/v1/payment/pricing-plans": {
    get: {
      tags: ["Payments"],
      summary: "Get pricing plans",
      description: "Lists pricing plans. Admin/Instructor only.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Pricing plans retrieved successfully",
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
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
    post: {
      tags: ["Payments"],
      summary: "Create pricing plan",
      description: "Creates a new pricing plan. Admin/Instructor only.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "price"],
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                interval: { type: "string", example: "monthly" },
                features: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Pricing plan created successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/payment/pricing-plans/{planId}": {
    put: {
      tags: ["Payments"],
      summary: "Update pricing plan",
      description: "Updates a pricing plan. Admin/Instructor only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "planId",
          required: true,
          schema: { type: "string" },
          description: "Pricing plan ID",
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number" },
                interval: { type: "string" },
                features: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Pricing plan updated successfully" },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Payments"],
      summary: "Delete pricing plan",
      description: "Deletes a pricing plan. Admin/Instructor only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "planId",
          required: true,
          schema: { type: "string" },
          description: "Pricing plan ID",
        },
      ],
      responses: {
        200: { description: "Pricing plan deleted successfully" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
