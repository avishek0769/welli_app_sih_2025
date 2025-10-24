import { Router } from "express";
import { auth } from "../middlewares/auth";
import { createChatbotConversation, deleteConversation, getAllConversation, mostRecentChat, updateTitle } from "../controllers/chatbotcoversation.controller";

const chatbotConversationRouter = Router()

chatbotConversationRouter.route("/create").post(auth, createChatbotConversation)
chatbotConversationRouter.route("/all").get(auth, getAllConversation)
chatbotConversationRouter.route("/:chatId").delete(auth, deleteConversation)
chatbotConversationRouter.route("/title/:chatId").put(auth, updateTitle)
chatbotConversationRouter.route("/latest").get(auth, mostRecentChat)

export default chatbotConversationRouter