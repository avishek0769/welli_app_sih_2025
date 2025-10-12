import { Router } from "express";
import { refreshTokens, sendVerificationCode, signUp, verifyCode } from "../controllers/user.controller";

const userRouter = Router()

userRouter.route("/sendVerificationCode").post(sendVerificationCode)
userRouter.route("/verifyCode").post(verifyCode)
userRouter.route("/signUp").post(signUp)
userRouter.route("/refreshTokens").post(refreshTokens)


export default userRouter;