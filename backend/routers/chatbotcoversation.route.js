import { Router } from "express";
import { auth } from "../middlewares/auth";
import { createChatbotConversation, deleteConversation, getAllConversation, mostRecentChat, updateTitle } from "../controllers/chatbotcoversation.controller";

const chatbotConversationRouter = Router()

chatbotConversationRouter.route("/create").post(auth, createChatbotConversation)
chatbotConversationRouter.route("/getAll").get(auth, getAllConversation)
chatbotConversationRouter.route("/delete/:chatId").delete(auth, deleteConversation)
chatbotConversationRouter.route("/updateTitle/:chatId").put(auth, updateTitle)
chatbotConversationRouter.route("/mostRecentChat").put(auth, mostRecentChat)

export default chatbotConversationRouter