import express from "express"
import { checkAuth, login, signup, updateProfile } from "../Controllers/UserController.js";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from "../Controllers/MessageController.js";

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUserForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.put('mark/:id', protectRoute, markMessageAsSeen);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;