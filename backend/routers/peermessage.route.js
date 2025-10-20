import { Router } from "express"
import auth from "../middlewares/auth"
import { clearChat, deleteForMe, getMessagesByChat } from "../controllers/peermessage.controller"

const peermessageRouter = Router()

peermessageRouter.route("/deleteForMe/:messageId").delete(auth, deleteForMe)
peermessageRouter.route("/clear/:chatId").delete(auth, clearChat)
peermessageRouter.route("/get/:chatId").get(auth, getMessagesByChat)
peermessageRouter.route("/getAllUnread").get(auth, getMessagesByChat)

export default peermessageRouter
