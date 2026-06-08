import jwt from "jsonwebtoken";
const getJwtSecret = () => {
    const jwt_token = process.env.JWT_SECRET;
    if (!jwt_token) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt_token;
};
const getRefreshSecret = () => {
    return process.env.JWT_REFRESH_SECRET || getJwtSecret();
};
export const generateToken = (payoad) => {
    const options = {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m"),
    };
    return jwt.sign(payoad, getJwtSecret(), options);
};
export const generateRefreshToken = (payoad) => {
    const options = {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d"),
    };
    return jwt.sign(payoad, getRefreshSecret(), options);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, getRefreshSecret());
};
