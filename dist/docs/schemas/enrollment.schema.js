export default {
    Enrollment: {
        type: "object",
        properties: {
            _id: { type: "string" },
            course: { type: "string", description: "Course ID" },
            student: { type: "string", description: "User ID" },
            status: {
                type: "string",
                enum: ["active", "completed", "dropped"],
                default: "active"
            },
            comletedLessons: {
                type: "array",
                items: { type: "string" },
                description: "Array of completed lesson IDs"
            },
            progress: { type: "number", default: 0, minimum: 0, maximum: 100 },
            completed: { type: "boolean", default: false },
            lastLesson: { type: "string", description: "Last viewed lesson ID" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
        }
    }
};
