import { Router } from "express"
import auth from "../middlewares/auth"
import { createComment, deleteComment, editComment, getAllComments } from "../controllers/comment.controller"

const commentRouter = Router()

commentRouter.route("/create").post(auth, createComment)
commentRouter.route("/:commentId").put(auth, editComment)
commentRouter.route("/:commentId").delete(auth, deleteComment)
commentRouter.route("/posts/:postId").get(auth, getAllComments)


export default commentRouter