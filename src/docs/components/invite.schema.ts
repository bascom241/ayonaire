export default {
  Invite: {
    type: "object",
    properties: {
      _id: { type: "string" },
      email: { type: "string", format: "email" },
      courseId: { type: "string" },
      cohortId: { type: "string" },
      token: { type: "string" },
      used: { type: "boolean" },
      expiresAt: { type: "string", format: "date-time" },
    },
  },
};
