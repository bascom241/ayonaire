import { Express } from "express";
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

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  const swaggerOptions = {
    swaggerOptions: {
      url: "/api-docs.json", // if you want to serve the spec separately
    },
  };

  // Serve the Swagger spec as JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Custom HTML with CDN links
  app.use("/api-docs", swaggerUi.serve, (req:any, res:any, next:any) => {
    if (req.method === "GET" && req.url === "/") {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ayonaire API Documentation</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
            <script>
              window.onload = function() {
                SwaggerUIBundle({
                  url: "/api-docs.json",
                  dom_id: '#swagger-ui',
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                  ],
                  layout: "StandaloneLayout"
                });
              };
            </script>
          </body>
        </html>
      `);
    }
    next();
  });
};
