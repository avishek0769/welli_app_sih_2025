import { Router } from "express";
import { checkUsername, createSignedUrl, currentUser, login, refreshTokens, sendVerificationCode, setIsActive, signUp, verifyCode, videoRecommendation, logout, updateAvatar, toggleAcceptMessages, deleteAccount } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.js";

const userRouter = Router()

userRouter.route("/send-code").post(sendVerificationCode)
userRouter.route("/verify-code").post(verifyCode)
userRouter.route("/signup").post(signUp)
userRouter.route("/login").post(login)
userRouter.route("/logout").post(auth, logout)
userRouter.route("/tokens").post(refreshTokens)
userRouter.route("/username/:username").get(checkUsername)
userRouter.route("/online").put(auth, setIsActive)
userRouter.route("/signed-url").get(auth, createSignedUrl)
userRouter.route("/current").get(auth, currentUser)
userRouter.route("/update-avatar").put(auth, updateAvatar)
userRouter.route("/toggle-messages").put(auth, toggleAcceptMessages)
userRouter.route("/delete-account").delete(auth, deleteAccount)
// userRouter.route("/profile").get(auth, profileDetails);
userRouter.route("/video-recommendation").get(auth, videoRecommendation);


export default userRouter;