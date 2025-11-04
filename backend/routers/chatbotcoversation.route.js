import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { createChatbotConversation, deleteConversation, getAllConversation, mostRecentChat, updateTitle } from "../controllers/chatbotcoversation.controller.js";

const chatbotConversationRouter = Router()

chatbotConversationRouter.route("/").post(auth, createChatbotConversation)
chatbotConversationRouter.route("/").get(auth, getAllConversation)
chatbotConversationRouter.route("/latest").get(auth, mostRecentChat)
chatbotConversationRouter.route("/:chatId").delete(auth, deleteConversation)
chatbotConversationRouter.route("/:chatId").put(auth, updateTitle)

export default chatbotConversationRouter