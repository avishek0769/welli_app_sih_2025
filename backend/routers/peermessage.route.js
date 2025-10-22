import { Router } from "express"
import auth from "../middlewares/auth"
import { clearChat, deleteForEveryone, deleteForMe, getMessagesByChat, getUnreadMessageCountByChat } from "../controllers/peermessage.controller"

const peermessageRouter = Router()

peermessageRouter.route("/get/:chatId").get(auth, getMessagesByChat)
peermessageRouter.route("/getAllUnread").get(auth, getUnreadMessageCountByChat)
peermessageRouter.route("/deleteForMe/:messageId").delete(auth, deleteForMe)
peermessageRouter.route("/deleteForEveryone/:messageId").delete(auth, deleteForEveryone)
peermessageRouter.route("/clear/:chatId").delete(auth, clearChat)

export default peermessageRouter
