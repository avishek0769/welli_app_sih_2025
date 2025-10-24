import { Router } from "express";
import { checkUsername, login, refreshTokens, sendVerificationCode, setIsActive, signUp, verifyCode } from "../controllers/user.controller";
import { auth } from "../middlewares/auth";

const userRouter = Router()

userRouter.route("/send-code").post(sendVerificationCode)
userRouter.route("/verify-code").post(verifyCode)
userRouter.route("/sign-up").post(signUp)
userRouter.route("/login").post(login)
userRouter.route("/tokens").post(refreshTokens)
userRouter.route("/username/:username").get(checkUsername)
userRouter.route("/is-active").get(auth, setIsActive)


export default userRouter;