import { Router } from "express"
import { auth } from "../middlewares/auth.js"
import { createPost, deletePost, editPost, getAllPosts, unseenPostCountByUser } from "../controllers/post.controller.js"

const postRouter = Router()

postRouter.route("/create").post(auth, createPost)
postRouter.route("/edit/:postId").put(auth, editPost)
postRouter.route("/delete/:postId").delete(auth, deletePost)
postRouter.route("/forum/:forumId").get(auth, getAllPosts)
postRouter.route("/unseen/count").get(auth, unseenPostCountByUser)


export default postRouter
