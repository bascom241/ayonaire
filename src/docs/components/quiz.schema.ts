export default {
  Quiz: {
    type: "object",
    properties: {
      _id: { type: "string" },
      title: { type: "string", example: "Chapter 1 Quiz" },
      module: { type: "string", description: "Module ID" },
      randomizeQuestions: { type: "boolean", default: false },
      showCorrectAnswers: { type: "boolean", default: false },
      allowRetakes: { type: "boolean", default: false },
      totalPoints: { type: "number", default: 0 },
      questions: {
        type: "array",
        items: { type: "string" },
        description: "Array of question IDs"
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Question: {
    type: "object",
    properties: {
      _id: { type: "string" },
      quiz: { type: "string", description: "Quiz ID" },
      question: { type: "string", example: "What is JavaScript?" },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string", example: "A programming language" },
            isCorrect: { type: "boolean", default: false }
          }
        }
      },
      multipleCorrectAnswer: { type: "boolean", default: false },
      randomizeChoice: { type: "boolean", default: false },
      points: { type: "number", default: 1 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  QuizAttempt: {
    type: "object",
    properties: {
      _id: { type: "string" },
      quiz: { type: "string", description: "Quiz ID" },
      user: { type: "string", description: "User ID" },
      answers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            selectedOptions: { type: "array", items: { type: "string" } },
            isCorrect: { type: "boolean" }
          }
        }
      },
      score: { type: "number" },
      completed: { type: "boolean", default: false },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  }
};