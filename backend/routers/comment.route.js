import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { createComment, deleteComment, editComment, getAllComments } from "../controllers/comment.controller.js"

const commentRouter = Router()

commentRouter.route("/create").post(auth, createComment)
commentRouter.route("/post/:postId").get(auth, getAllComments)
commentRouter.route("/:commentId").put(auth, editComment)
commentRouter.route("/:commentId").delete(auth, deleteComment)


export default commentRouter