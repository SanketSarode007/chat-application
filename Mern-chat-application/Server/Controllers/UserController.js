import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
//Sign Up a new User
export async function signup(req, res) {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({ success: false, message: "Account Already exists." })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })

        const token = generateToken(newUser._id);
        return res.json({ success: true, userData: newUser, token, message: "Account Created Successfully." })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error + "Error at signup function" })
    }
}

//Controller to login the user
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email })
        //console.log(userData.password)

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        //console.log(isPasswordCorrect);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const token = generateToken(userData._id);

        res.json({ success: true, userData, token, message: "Login Successfull" })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error + " Error at Login function" })
    }
}

//Controller to check if user is authenticated

export function checkAuth(req, res) {
    res.json({ success: true, user: req.user })
}

//Controller to update user profile details
export async function updateProfile(req, res) {
    try {
        //console.log(req.body)
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }

        res.json({ success: true, user: updatedUser })
    } catch (error) {
        res.json({ success: false, message: error.message + "Error at updateProfile function try block" })
    }
}