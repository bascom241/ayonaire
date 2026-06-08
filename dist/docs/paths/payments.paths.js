export default {
    "/api/v1/payment/initialize": {
        post: {
            tags: ["Payments"],
            summary: "Initialize payment",
            description: "Creates a Paystack payment authorization URL for the authenticated user.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["courseId"],
                            properties: {
                                courseId: { type: "string", example: "661f2a8c9c1234567890abcd" },
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
                                    data: { type: "string", description: "Paystack authorization URL" },
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
            description: "Receives Paystack webhook events. Requires x-paystack-signature header.",
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
                { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
                { in: "query", name: "sortBy", schema: { type: "string", default: "createdAt" } },
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
            description: "Updates billing and shipping details for an order. Admin only.",
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
};
