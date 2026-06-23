export default {
    Workshop: {
        type: "object",
        properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            platform: { type: "string" },
            status: { type: "string" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
        },
    },
};
