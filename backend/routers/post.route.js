import { Router } from "express"
import auth from "../middlewares/auth"
import { createPost, deletePost, editPost, getAllPosts } from "../controllers/post.controller"

const postRouter = Router()

postRouter.route("/create").post(auth, createPost)
postRouter.route("/edit/:postId").put(auth, editPost)
postRouter.route("/delete/:postId").delete(auth, deletePost)
postRouter.route("/get/:forumId").get(auth, getAllPosts)


export default postRouter
