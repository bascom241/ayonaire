export default {
    Payment: {
        type: "object",
        properties: {
            _id: { type: "string" },
            student: { type: "string", description: "User ID" },
            course: { type: "string", description: "Course ID" },
            enrollment: { type: "string", description: "Enrollment ID" },
            amount: { type: "number", example: 99.99 },
            currency: { type: "string", default: "NGN", example: "NGN" },
            reference: { type: "string", unique: true, example: "PAY-123456" },
            channel: { type: "string", example: "card" },
            status: {
                type: "string",
                enum: ["pending", "successful", "failed"],
                default: "pending"
            },
            paidAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
        }
    },
    PaymentInitialize: {
        type: "object",
        required: ["courseId"],
        properties: {
            courseId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", default: "NGN" }
        }
    }
};
