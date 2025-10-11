import { Router } from "express";
import { sendVerificationCode, signUp, verifyCode } from "../controllers/user.controller";

const userRouter = Router()

userRouter.route("/sendVerificationCode").post(sendVerificationCode)
userRouter.route("/verifyCode").post(verifyCode)
userRouter.route("/signUp").post(signUp)


export default userRouter;