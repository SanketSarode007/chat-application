import jwt from "jsonwebtoken"
import User from "../models/User.js";
//Middle ware to protect routes

export async function protectRoute(req, res, next){
    try{
        //console.log(req.headerscount);
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
            res.json({success: false, message: "User not found"})
        }

        req.user = user;
        next();
    }catch(error){
        res.json({success: false,message: error.message + "Error is at auth.js protectRoute function"})
    }
}

