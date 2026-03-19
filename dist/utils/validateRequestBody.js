import { AppError } from "../errors/AppError.js";
export function validateRequestBodyWithValues(data, requiredFields) {
    const missingFields = requiredFields.filter((field) => {
        const value = data[field];
        return value === undefined || value === null || value === "";
    });
    if (missingFields.length > 0) {
        const fieldNames = missingFields
            .map((field) => `"${String(field)}"`)
            .join(", ");
        throw new AppError(` missing fields: ${fieldNames}`, 400);
    }
}
