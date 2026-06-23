export default {
  Feed: {
    type: "object",
    properties: {
      _id: { type: "string" },
      content: { type: "string" },
      media: { type: "string" },
      likes: { type: "array", items: { type: "string" } },
      comments: { type: "array", items: { type: "object" } },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
};
