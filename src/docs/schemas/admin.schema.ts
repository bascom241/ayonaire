export default {
  AdminProfile: {
    type: "object",
    properties: {
      _id: { type: "string" },
      adminId: { type: "string", description: "User ID reference" },
      fullName: { type: "string", example: "Admin User" },
      shortBio: { type: "string", example: "System administrator" },
      department: { type: "string", example: "IT Department" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
};
