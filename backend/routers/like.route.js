import { Router } from "express"
import auth from "../middlewares/auth"
import { getAllCommentLikes, getAllPostLikes, likeComment, likePost, unlikeComment, unlikePost } from "../controllers/like.controller"

const likeRouter = Router()

likeRouter.route("/post/:postId").post(auth, likePost)
likeRouter.route("/unlike/:likeId/post/:postId").post(auth, unlikePost)
likeRouter.route("/comment/:commentId").post(auth, likeComment)
likeRouter.route("/unlike/:likeId/comment/:commentId").post(auth, unlikeComment)
likeRouter.route("/post/:postId").get(auth, getAllPostLikes)
likeRouter.route("/comment/:commentId").get(auth, getAllCommentLikes)


export default likeRouter