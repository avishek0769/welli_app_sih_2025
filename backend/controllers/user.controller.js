import { Twilio } from "twilio";
import { User } from "../models/user.model";
import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"

const client = new Twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

/*
TODOs -
1. Change fields - annonymous username, real fullname, remove institution
2. Add username taken alert
*/

const sendVerificationCode = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    let otp = Math.floor(Math.random() * (999999 - 111111 + 1) + 111111)

    const oldUser = await User.findOne({ phone: phoneNumber })
    let newUser;

    if (oldUser) {
        oldUser.otp = otp;
        await oldUser.save()
    }
    else {
        newUser = await User.create({
            phone: phoneNumber,
            otp
        })
    }

    let message = await client.messages.create({
        body: `Welcome from Welli! Your OTP is ${otp}`,
        to: phoneNumber,
        from: process.env.TWILIO_FROM
    })

    return res.status(200).json(new ApiResponse(200, { dateSent: message.dateSent }, "Email sent successfully"))
})

const verifyCode = asyncHandler(async (req, res) => {
    const { phoneNumber, code } = req.body;
    
    const user = await User.findOne({ phone: phoneNumber })

    if(user.otp == code) {
        user.isVerified = true;
        await user.save()
        return res.status(200).send("OTP has been verified")
    }
    else {
        throw new ApiError(401, "OTP is incorrect")
    }
})

const signUp = asyncHandler(async (req, res) => {
    const { annonymousUsername, realFullname, password, gender, age, phoneNumber } = req.body;

    let user = await User.findOne({ phone: phoneNumber }).select("-password")
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if(user.isVerified) {
        user.annonymousUsername = annonymousUsername,
        user.realFullname = realFullname,
        user.gender = gender,
        user.age = age,
        user.password = password,
        user.accessToken = accessToken,
        user.refreshToken = refreshToken
        await user.save()
    }
    else {
        throw new ApiError(401, "User's phone number is not verified")
    }

    return res.status(200).json(200, user, "User has registered successfully")
})


export {
    sendVerificationCode,
    verifyCode,
    signUp
}