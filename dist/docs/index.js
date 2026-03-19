import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import packageJson from "../../package.json" with { type: "json" };
// Import path definitions
import userPaths from "./paths/user.paths.js";
import coursePaths from "./paths/course.paths.js";
import cohortPaths from "./paths/cohorts.paths.js";
import lessonPaths from "./paths/lesson.paths.js";
import paymentPaths from "./paths/payments.paths.js";
import quizPaths from "./paths/quiz.paths.js";
import instructorPaths from "./paths/instructor.paths.js";
import enrollPaths from "./paths/enroll.paths.js";
import modulePaths from "./paths/module.paths.js";
// Import schemas
import userSchemas from "./schemas/user.schema.js";
import courseSchemas from "./schemas/course.schema.js";
import cohortSchemas from "./schemas/cohort.schema.js";
import lessonSchemas from "./schemas/lesson.schema.js";
import paymentSchemas from "./schemas/payment.schema.js";
import quizSchemas from "./schemas/quiz.schema.js";
import instructorSchemas from "./schemas/instructor.schema.js";
import enrollmentSchemas from "./schemas/enrollment.schema.js";
import moduleSchemas from "./schemas/module.schema.js";
import assignmentSchemas from "./schemas/assignment.schema.js";
import adminSchemas from "./schemas/admin.schema.js";
// Import components
import { securitySchemes } from "./components/security.js";
import { responses } from "./components/responses.js";
import { parameters } from "./components/parameters.js";
import tags from "./tags.js";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ayonaire API Service",
            version: packageJson.version,
            description: "API documentation for Ayonaire backend",
            contact: {
                name: "API Support",
                email: "support@ayonaire.com",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
            },
            {
                url: "https://api.ayonaire.com",
                description: "Production server",
            },
        ],
        tags,
        components: {
            securitySchemes,
            schemas: {
                ...userSchemas,
                ...courseSchemas,
                ...cohortSchemas,
                ...lessonSchemas,
                ...paymentSchemas,
                ...quizSchemas,
                ...instructorSchemas,
                ...enrollmentSchemas,
                ...moduleSchemas,
                ...assignmentSchemas,
                ...adminSchemas,
            },
            responses,
            parameters,
        },
        security: [{ bearerAuth: [] }],
        paths: {
            ...userPaths,
            ...coursePaths,
            ...cohortPaths,
            ...lessonPaths,
            ...paymentPaths,
            ...quizPaths,
            ...instructorPaths,
            ...enrollPaths,
            ...modulePaths,
        },
    },
    apis: [],
};
const swaggerSpec = swaggerJsdoc(options);
export const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Ayonaire API Documentation",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
        },
    }));
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    app.get("/", (req, res) => {
        res.redirect("/api-docs");
    });
    console.log("📄 Swagger documentation available at /api-docs");
};
export { swaggerSpec };
