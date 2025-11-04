import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { createChatbotMessage, getAllChats, getAudio } from "../controllers/chatbotmessage.controller.js"

const chatbotMessageRouter = Router()

chatbotMessageRouter.route("/").post(auth, createChatbotMessage)
chatbotMessageRouter.route("/audio/:messageId").get(auth, getAudio)
chatbotMessageRouter.route("/:chatId").get(auth, getAllChats)

export default chatbotMessageRouter