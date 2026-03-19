export default {
    Course: {
        type: "object",
        properties: {
            _id: { type: "string", example: "60d21b4667d0d8992e610c86" },
            title: { type: "string", example: "Introduction to Programming" },
            thumbnail: {
                type: "object",
                properties: {
                    url: { type: "string", example: "https://example.com/thumbnail.jpg" },
                    publicId: { type: "string", example: "courses/thumb123" }
                },
                required: ["url", "publicId"]
            },
            introVideo: {
                type: "object",
                properties: {
                    url: { type: "string", example: "https://example.com/intro.mp4" },
                    publicId: { type: "string", example: "courses/intro123" },
                    duration: { type: "number", example: 120 }
                }
            },
            description: { type: "string", example: "Learn programming basics" },
            category: {
                type: "string",
                description: "Course category ID"
            },
            instructor: {
                type: "string",
                description: "Instructor ID"
            },
            price: { type: "number", example: 99.99 },
            status: {
                type: "string",
                enum: ["draft", "published", "archived"],
                example: "published"
            },
            courseLevel: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
                example: "beginner"
            },
            modules: {
                type: "array",
                items: { type: "string" }
            },
            students: {
                type: "array",
                items: { type: "string" }
            },
            completionCount: { type: "number", default: 0 },
            cohorts: {
                type: "array",
                items: { type: "string" }
            },
            completionCertificate: { type: "boolean", default: false },
            enrollments: {
                type: "array",
                items: { type: "string" }
            }
        }
    },
    CourseCategory: {
        type: "object",
        properties: {
            _id: { type: "string" },
            title: {
                type: "string",
                enum: ["programming", "design", "business", "marketing", "music", "photography", "health", "fitness", "language", "other"]
            }
        }
    },
    CourseCreate: {
        type: "object",
        required: ["title", "thumbnail", "category"],
        properties: {
            title: { type: "string", example: "Introduction to Programming" },
            description: { type: "string", example: "Learn programming basics" },
            category: { type: "string" },
            price: { type: "number", example: 99.99 },
            courseLevel: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"]
            },
            thumbnail: {
                type: "string",
                format: "binary",
                description: "Course thumbnail image"
            }
        }
    }
};
