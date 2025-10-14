import { Router } from "express"
import auth from "../middlewares/auth"
import { createComment, deleteComment, editComment, getAllComments } from "../controllers/comment.controller"

const commentRouter = Router()

commentRouter.route("/create").post(auth, createComment)
commentRouter.route("/edit/:commentId").put(auth, editComment)
commentRouter.route("/delete/:commentId").delete(auth, deleteComment)
commentRouter.route("/get/:forumId").get(auth, getAllComments)


export default commentRouter