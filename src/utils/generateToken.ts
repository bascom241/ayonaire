
import { TokenPayload } from "../types/user.types.js"
import jwt from "jsonwebtoken"

export const generateToken = (payoad:TokenPayload ) => {
    const jwt_token = process.env.JWT_SECRET;
    if(!jwt_token){
        throw new Error("JWT_SECRET is not defined")
    }

    return jwt.sign(payoad, jwt_token, {expiresIn: "7d"});
}