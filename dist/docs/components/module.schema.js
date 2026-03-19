export default {
    Module: {
        type: "object",
        properties: {
            _id: { type: "string" },
            title: { type: "string", example: "Chapter 1: Introduction" },
            description: { type: "string", example: "Basic concepts" },
            course: { type: "string", description: "Course ID" },
            order: { type: "number", example: 1 },
            lessons: {
                type: "array",
                items: { type: "string" },
                description: "Array of lesson IDs"
            },
            assignment: { type: "string", description: "Assignment ID" },
            quizzes: {
                type: "array",
                items: { type: "string" },
                description: "Array of quiz IDs"
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
        }
    }
};
