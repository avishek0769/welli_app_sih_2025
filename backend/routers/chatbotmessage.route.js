import { Router } from "express"
import { createChatbotMessage, getAllChats, getAudio } from "../controllers/chatbotmessage.controller"


const chatbotMessageRouter = Router()

chatbotMessageRouter.route("/create").post(auth, createChatbotMessage)
chatbotMessageRouter.route("/:chatId").get(auth, getAllChats)
chatbotMessageRouter.route("/audio/:messageId").get(auth, getAudio)

export default chatbotMessageRouter