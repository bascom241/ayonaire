// build-swagger.ts
import fs from "fs";
import path from "path";

// Import the swaggerSpec from your TypeScript setup
import { swaggerSpec } from "./src/docs/index.ts"; // no .ts extension needed

// Define output path for the generated JSON
const outputDir = path.join(process.cwd(), "public", "swagger");
const outputFile = path.join(outputDir, "swagger.json");

// Make sure the folder exists
fs.mkdirSync(outputDir, { recursive: true });

// Write swaggerSpec to swagger.json
fs.writeFileSync(outputFile, JSON.stringify(swaggerSpec, null, 2));

console.log("✅ swagger.json generated at:", outputFile);