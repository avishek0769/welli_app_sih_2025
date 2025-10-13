import { Router } from "express";
import { checkUsername, login, refreshTokens, sendVerificationCode, setIsActive, signUp, verifyCode } from "../controllers/user.controller";
import { auth } from "../middlewares/auth";

const userRouter = Router()

userRouter.route("/sendVerificationCode").post(sendVerificationCode)
userRouter.route("/verifyCode").post(verifyCode)
userRouter.route("/signUp").post(signUp)
userRouter.route("/login").post(login)
userRouter.route("/refreshTokens").post(refreshTokens)
userRouter.route("/checkUsername").post(checkUsername)
userRouter.route("/setIsActive").get(auth, setIsActive)


export default userRouter;