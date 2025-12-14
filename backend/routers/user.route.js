import { Router } from "express";
import { checkUsername, createSignedUrl, currentUser, login, refreshTokens, sendVerificationCode, setIsActive, signUp, verifyCode, videoRecommendation } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";

const userRouter = Router()

userRouter.route("/send-code").post(sendVerificationCode)
userRouter.route("/verify-code").post(verifyCode)
userRouter.route("/signup").post(signUp)
userRouter.route("/login").post(login)
userRouter.route("/tokens").post(refreshTokens)
userRouter.route("/username/:username").get(checkUsername)
userRouter.route("/online").put(auth, setIsActive)
userRouter.route("/signed-url").get(auth, createSignedUrl)
userRouter.route("/current").get(auth, currentUser)
// userRouter.route("/profile").get(auth, profileDetails);
userRouter.route("/video-recommendation").get(auth, videoRecommendation);


export default userRouter;