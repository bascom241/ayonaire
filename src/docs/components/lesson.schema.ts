export default {
  Lesson: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string", example: "Variables and Data Types" },
      module: { type: "string", description: "Module ID" },
      course: { type: "string", description: "Course ID" },
      order: { type: "number", example: 1 },
      duration: { type: "number", example: 600 },
      isPublished: { type: "boolean", default: false },
      isFreePreview: { type: "boolean", default: false },
      isLocked: { type: "boolean", default: true },
      videos: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "url", "publicId", "duration"],
          properties: {
            title: { type: "string", example: "Introduction Video" },
            url: { type: "string", example: "https://example.com/video.mp4" },
            publicId: { type: "string", example: "lessons/vid123" },
            duration: { type: "number", example: 300 }
          }
        }
      },
      materials: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", example: "Slides.pdf" },
            url: { type: "string", example: "https://example.com/slides.pdf" },
            publicId: { type: "string", example: "materials/pdf123" }
          }
        }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  }
};