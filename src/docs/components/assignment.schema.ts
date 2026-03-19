export default {
  Assignment: {
    type: "object",
    properties: {
      _id: { type: "string" },
      instructor: { type: "string", description: "Instructor ID" },
      course: { type: "string", description: "Course ID" },
      title: { type: "string", example: "Final Project" },
      description: { type: "string", example: "Build a web application" },
      materials: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", example: "Project Guidelines.pdf" },
            url: { type: "string", example: "https://example.com/guidelines.pdf" },
            publicId: { type: "string", example: "assignments/guide123" }
          }
        }
      },
      module: { type: "string", description: "Module ID" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  }
};