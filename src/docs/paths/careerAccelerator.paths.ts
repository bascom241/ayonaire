export default {
  "/api/v1/career/resume": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate AI resume content",
      description:
        "Create an AI-powered resume summary and role-focused bullet points.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerResumeRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "AI resume generated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/cover-letter": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate AI cover letter",
      description: "Generate a tailored cover letter for a role and company.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerCoverLetterRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Cover letter generated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/ayonaire-jobs": {
    get: {
      tags: ["Career Accelerator"],
      summary: "Search Ayonaire job listings",
      description: "Browse sample Ayonaire job opportunities for students.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "keywords",
          schema: { type: "string" },
          description: "Search keywords",
        },
        {
          in: "query",
          name: "location",
          schema: { type: "string" },
          description: "Job location",
        },
        {
          in: "query",
          name: "skills",
          schema: { type: "string" },
          description: "Skills filter",
        },
        {
          in: "query",
          name: "role",
          schema: { type: "string" },
          description: "Role filter",
        },
      ],
      responses: {
        200: {
          description: "Job listings returned",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        remote: { type: "boolean" },
                        salaryRange: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        summary: { type: "string" },
                        postedAt: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/linkedin-import": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Import LinkedIn profile",
      description:
        "Extract career summary and skills from a LinkedIn profile text or URL.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                profileUrl: { type: "string", format: "uri" },
                profileText: { type: "string" },
              },
              example: {
                profileText:
                  "Experienced learner with project work in UX design and frontend development.",
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "LinkedIn profile imported",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      importedProfile: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/portfolio": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate AI portfolio description",
      description: "Build a portfolio summary and project showcase with AI.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerPortfolioRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Portfolio output generated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/CareerAIResponse" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/resume-builder": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Build complete resume draft",
      description: "Generate a full resume structure and suggested content.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerResumeBuilderRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Resume builder output returned",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/skill-gap": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Analyze skills gap",
      description: "Provide a skills gap summary and recommended growth plan.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerSkillGapRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Skill gap analysis returned",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/marketplace": {
    get: {
      tags: ["Career Accelerator"],
      summary: "Browse talent marketplace",
      description: "Search sample job and freelance listings for students.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "keywords",
          schema: { type: "string" },
          description: "Search keywords",
        },
        {
          in: "query",
          name: "location",
          schema: { type: "string" },
          description: "Location filter",
        },
        {
          in: "query",
          name: "skills",
          schema: { type: "string" },
          description: "Skills filter",
        },
        {
          in: "query",
          name: "role",
          schema: { type: "string" },
          description: "Role filter",
        },
      ],
      responses: {
        200: {
          description: "Marketplace results returned",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        remote: { type: "boolean" },
                        salaryRange: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        summary: { type: "string" },
                        postedAt: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/freelance-profile": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Create freelance profile",
      description:
        "Save a student freelance profile for marketplace opportunities.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/FreelanceProfileRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Freelance profile created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string" },
                      headline: { type: "string" },
                      summary: { type: "string" },
                      skills: { type: "array", items: { type: "string" } },
                      portfolioLinks: {
                        type: "array",
                        items: { type: "string" },
                      },
                      hourlyRate: { type: "string" },
                      availability: { type: "string" },
                      services: { type: "array", items: { type: "string" } },
                      expertiseAreas: {
                        type: "array",
                        items: { type: "string" },
                      },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/career-roadmap": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate career roadmap",
      description: "Build a step-by-step career roadmap for the target role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerRoadmapRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Career roadmap generated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/ai-interview": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate AI interview practice",
      description: "Generate interview questions and tips for the target role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CareerInterviewRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Interview practice generated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/career/company-interview": {
    post: {
      tags: ["Career Accelerator"],
      summary: "Generate company-specific interview practice",
      description:
        "Create interview preparation for a specific company and role.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CompanyInterviewRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Company interview practice generated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CareerAIResponse" },
            },
          },
        },
      },
    },
  },
};
