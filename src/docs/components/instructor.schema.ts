export default {
  Instructor: {
    type: "object",
    properties: {
      _id: { type: "string" },
      instructorId: { 
        type: "string",
        description: "User ID reference"
      },
      bio: { type: "string", example: "Experienced developer with 10 years in industry" },
      expertise: {
        type: "array",
        items: { type: "string" },
        example: ["JavaScript", "React", "Node.js"]
      },
      instructorCourseCategory: {
        type: "string",
        description: "Course category ID"
      },
      applicationStatus: {
        type: "string",
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      courses: {
        type: "array",
        items: { type: "string" },
        description: "Array of course IDs"
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  InstructorApplication: {
    type: "object",
    required: ["expertise", "instructorCourseCategory"],
    properties: {
      bio: { type: "string" },
      expertise: { 
        type: "array", 
        items: { type: "string" },
        example: ["JavaScript", "React"]
      },
      instructorCourseCategory: { type: "string" }
    }
  }
};