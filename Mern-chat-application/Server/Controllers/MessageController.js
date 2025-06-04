import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js"

//Get all user except the logged in users
export async function getUserForSidebar(req, res) {
    try {
        const userId = req.user._id;

        //$ne - 'not equal to' to filter the data 
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        //console.log(filteredUsers);

        //Count number of message not seen
        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({ senderId: user._id, recevierId: userId, seen: false })
            
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }

        })
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers, unseenMessages })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message + "Error at getUserForSidebar try block" })
    }
}

//Get all the messages for selected user
export async function getMessages(req, res) {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recevierId: selectedUserId },
                { senderId: selectedUserId, recevierId: myId }
            ]
        })

        await Message.updateMany({ senderId: selectedUserId, recevierId: myId }, { seen: true })

        res.json({ success: true, messages })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message + "Error at getMessages function try block" })

    }
}

//API to mark message as seen using message Id
export async function markMessageAsSeen(req, res) {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true })
        res.json({ success: true, message: "Success at markMessageAsSeen function" })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message + "Error at getMessages function try block" })

    }
}

//Send message to selected user
export async function sendMessage(req, res) {
    try {
        const { text, image } = req.body;
        const recevierId = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = Message.create({
            senderId,
            recevierId,
            text,
            image: imageUrl
        })

        //* Emit the new message to the recevier's socket
        const recevierSocketId = userSocketMap[recevierId];

        if (recevierSocketId) {
            io.to(recevierSocketId).emit("newMessage", newMessage)
        }

        res.json({ success: false, newMessage })
    } catch (error) {
        console.log(error.message)
        return res.json({ success: false, message: error.message + "Error at sendMessage function try block" })
    }
}