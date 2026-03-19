import { Express } from "express";
import express from "express"
import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import packageJson from "../../package.json" with  { type: "json" };

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ayonaire API Service",
      version: packageJson.version,
      description: "API documentation for Ayonaire backend",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [{ bearerAuth: [] }],

  
    paths: {
      "/api/v1/user/register": {
        post: {
          tags: ["Users"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created successfully" },
            400: { description: "Bad request" },
          },
        },
      },

      "/api/v1/user/login": {
        post: {
          tags: ["Users"],
          summary: "Login a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/v1/user/non-admin-users": {
        get: {
          tags: ["Admin"],
          summary: "Get all non-admin users",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Users retrieved" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  },

  apis: [], 
};

// Generate swagger.json on server start
const generateSwaggerJSON = () => {
  const swaggerSpec = swaggerJsdoc(options);
  const outputDir = path.join(process.cwd(), "public/swagger");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "swagger.json"), JSON.stringify(swaggerSpec, null, 2));
  console.log("swagger.json generated ✅");
};

export const setupSwagger = (app: Express) => {
  // Generate swagger.json automatically
  generateSwaggerJSON();

  // Serve static Swagger UI folder
  const swaggerPath = path.join(process.cwd(), "public/swagger");
  app.use("/api-docs", express.static(swaggerPath));

  // Optional: redirect root to docs
  app.get("/", (req, res) => res.redirect("/api-docs"));
};
