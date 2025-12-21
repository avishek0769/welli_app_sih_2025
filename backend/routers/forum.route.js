import { Router } from "express"
import { createForum, joinedForums, getForumDetails, getForumMembers, joinForum, leaveForum, getAllForums, searchForums } from "../controllers/forum.controller.js"
import { auth } from "../middlewares/auth.js"

const forumRouter = Router()

forumRouter.route("/create").post(createForum)
forumRouter.route("/all").get(auth, getAllForums)
forumRouter.route("/search").get(auth, searchForums)
forumRouter.route("/join/:forumId").get(auth, joinForum)
forumRouter.route("/leave/:forumId").get(auth, leaveForum)
forumRouter.route("/members/:forumId").get(auth, getForumMembers)
forumRouter.route("/joined").get(auth, joinedForums)
forumRouter.route("/:forumId").get(auth, getForumDetails)

export default forumRouter