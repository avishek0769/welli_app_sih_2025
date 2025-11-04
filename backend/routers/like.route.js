import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { getAllCommentLikes, getAllPostLikes, likeComment, likePost, unlikeComment, unlikePost } from "../controllers/like.controller.js"

const likeRouter = Router()

likeRouter.route("/post/:postId").post(auth, likePost)
likeRouter.route("/post/:postId").get(auth, getAllPostLikes)
likeRouter.route("/unlike/post/:postId").delete(auth, unlikePost)

likeRouter.route("/comment/:commentId").post(auth, likeComment)
likeRouter.route("/comment/:commentId").get(auth, getAllCommentLikes)
likeRouter.route("/unlike/comment/:commentId").delete(auth, unlikeComment)


export default likeRouter