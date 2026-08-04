export default {
  "/api/v1/quiz/question": {
    post: {
      tags: ["Quiz"],
      summary: "Create quiz question",
      description: "Creates a new quiz question (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["quiz", "question", "options"],
              properties: {
                quiz: { type: "string", description: "Quiz ID" },
                question: { type: "string", example: "What is JavaScript?" },
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      isCorrect: { type: "boolean" },
                    },
                  },
                  minItems: 2,
                },
                multipleCorrectAnswer: { type: "boolean", default: false },
                randomizeChoice: { type: "boolean", default: false },
                points: { type: "number", default: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Question created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Question created successfully",
                  },
                  question: { $ref: "#/components/schemas/Question" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/quiz/quiz/submit": {
    post: {
      tags: ["Quiz"],
      summary: "Submit quiz answers",
      description: "Submits answers for a quiz",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["quiz", "answers"],
              properties: {
                quiz: { type: "string", description: "Quiz ID" },
                answers: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["question", "selectedOptions"],
                    properties: {
                      question: { type: "string" },
                      selectedOptions: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Quiz submitted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  attempt: { $ref: "#/components/schemas/QuizAttempt" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
      },
    },
  },

  "/api/v1/quiz/quiz": {
    post: {
      tags: ["Quiz"],
      summary: "Create quiz",
      description: "Creates a new quiz (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "module"],
              properties: {
                title: { type: "string", example: "Chapter 1 Quiz" },
                module: { type: "string", description: "Module ID" },
                randomizeQuestions: { type: "boolean", default: false },
                showCorrectAnswers: { type: "boolean", default: false },
                allowRetakes: { type: "boolean", default: false },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Quiz created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Quiz created successfully",
                  },
                  quiz: { $ref: "#/components/schemas/Quiz" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
    get: {
      tags: ["Quiz"],
      summary: "Get all quizzes",
      description:
        "Returns quizzes visible to the authenticated user (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "number", default: 1 } },
        { in: "query", name: "limit", schema: { type: "number", default: 10 } },
      ],
      responses: {
        200: {
          description: "Quizzes retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Quiz" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
      },
    },
  },

  "/api/v1/quiz/quiz/{quizId}": {
    get: {
      tags: ["Quiz"],
      summary: "Get single quiz",
      description: "Returns one quiz by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "quizId",
          required: true,
          schema: { type: "string" },
          description: "Quiz ID",
        },
      ],
      responses: {
        200: {
          description: "Quiz retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Quiz" },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    put: {
      tags: ["Quiz"],
      summary: "Update quiz",
      description: "Updates a quiz (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "quizId",
          required: true,
          schema: { type: "string" },
          description: "Quiz ID",
        },
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                randomizeQuestions: { type: "boolean" },
                showCorrectAnswers: { type: "boolean" },
                allowRetakes: { type: "boolean" },
                status: { type: "string" },
                dueDate: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Quiz updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Quiz" },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/ValidationError" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
    delete: {
      tags: ["Quiz"],
      summary: "Delete quiz",
      description: "Deletes a quiz (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "quizId",
          required: true,
          schema: { type: "string" },
          description: "Quiz ID",
        },
      ],
      responses: {
        200: { description: "Quiz deleted successfully" },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },

  "/api/v1/quiz/quiz/{quizId}/results": {
    get: {
      tags: ["Quiz"],
      summary: "Get quiz results",
      description: "Returns quiz attempt results (Admin/Instructor only)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "quizId",
          required: true,
          schema: { type: "string" },
          description: "Quiz ID",
        },
      ],
      responses: {
        200: {
          description: "Results retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/QuizAttempt" },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/UnauthorizedError" },
        403: { $ref: "#/components/responses/ForbiddenError" },
        404: { $ref: "#/components/responses/NotFoundError" },
      },
    },
  },
};
