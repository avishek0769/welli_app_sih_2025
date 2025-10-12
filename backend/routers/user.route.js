import { Router } from "express";
import { checkUsername, login, refreshTokens, sendVerificationCode, signUp, verifyCode } from "../controllers/user.controller";

const userRouter = Router()

userRouter.route("/sendVerificationCode").post(sendVerificationCode)
userRouter.route("/verifyCode").post(verifyCode)
userRouter.route("/signUp").post(signUp)
userRouter.route("/login").post(login)
userRouter.route("/refreshTokens").post(refreshTokens)
userRouter.route("/checkUsername").post(checkUsername)


export default userRouter;