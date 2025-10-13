import { Router } from "express"
import { createForum, getForumDetails, getForumMembers, joinForum, leaveForum } from "../controllers/forum.controller"
import auth from "../middlewares/auth"

const forumRouter = Router()

forumRouter.route("/create").post(createForum)
forumRouter.route("/join/:forumId").get(auth, joinForum)
forumRouter.route("/leave/:forumId").get(auth, leaveForum)
forumRouter.route("/members").get(auth, getForumMembers)
forumRouter.route("/details").get(auth, getForumDetails)

export default forumRouter