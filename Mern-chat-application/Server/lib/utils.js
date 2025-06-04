import jwt from "jsonwebtoken"

//Function to generate token for user
export function generateToken(userId){
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}