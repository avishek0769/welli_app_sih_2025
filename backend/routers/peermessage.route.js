import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { clearChat, deleteForEveryone, deleteForMe, getMessagesByChat, getUnreadMessageCountByChat } from "../controllers/peermessage.controller.js"

const peerMessageRouter = Router()

peerMessageRouter.route("/all/:chatId").get(auth, getMessagesByChat)
peerMessageRouter.route("/unread/:chatId").get(auth, getUnreadMessageCountByChat)
peerMessageRouter.route("/delete/for-me/:messageId").delete(auth, deleteForMe)
peerMessageRouter.route("/delete/for-everyone/:messageId").delete(auth, deleteForEveryone)
peerMessageRouter.route("/clear/:chatId").delete(auth, clearChat)

export default peerMessageRouter
