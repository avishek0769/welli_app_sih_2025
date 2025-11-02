import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { createChatbotMessage, getAllChats, getAudio } from "../controllers/chatbotmessage.controller.js"

const chatbotMessageRouter = Router()

chatbotMessageRouter.route("/create").post(auth, createChatbotMessage)
chatbotMessageRouter.route("/:chatId").get(auth, getAllChats)
chatbotMessageRouter.route("/audio/:messageId").get(auth, getAudio)

export default chatbotMessageRouter