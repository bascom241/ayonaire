export default {
    Cohort: {
        type: "object",
        properties: {
            _id: { type: "string" },
            name: { type: "string", example: "Cohort 2024 A" },
            creator: {
                type: "string",
                description: "Instructor ID who created the cohort"
            },
            course: {
                type: "string",
                description: "Course ID"
            },
            students: {
                type: "array",
                items: { type: "string" },
                description: "Array of student user IDs"
            },
            description: { type: "string" },
            isActive: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
        }
    }
};
