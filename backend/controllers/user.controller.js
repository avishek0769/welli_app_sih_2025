import { Twilio } from "twilio";
import User from "../models/user.model";
import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import jwt from "jsonwebtoken";
import Forum from "../models/forum.model";

const client = new Twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

/*
TODOs -
1. Change fields - annonymous username, real fullname, remove institution
2. Add username taken alert
3. Make unique Avatar field
*/

const sendVerificationCode = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        throw new ApiError(401, "Phone number is empty")
    }

    let otp = Math.floor(Math.random() * (999999 - 111111 + 1) + 111111)

    const oldUser = await User.findOne({ phone: phoneNumber })

    if (oldUser) {
        oldUser.otp = otp;
        await oldUser.save()
    }
    else {
        await User.create({
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

    if (!phoneNumber || !code) {
        throw new ApiError(401, "Phone number or otp is empty")
    }

    const user = await User.findOne({ phone: phoneNumber })

    if (user.otp == code) {
        user.isVerified = true;
        await user.save()
        return res.status(200).send("OTP has been verified")
    }
    else {
        throw new ApiError(402, "OTP is incorrect")
    }
})

const signUp = asyncHandler(async (req, res) => {
    const { annonymousUsername, realFullname, password, gender, age, phoneNumber, avatar } = req.body;

    if (!annonymousUsername || !realFullname || !password || !gender || !age || !phoneNumber || !avatar) {
        throw new ApiError(401, "All fields are required")
    }

    let user = await User.findOne({ phone: phoneNumber }).select("-password")
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if (user.isVerified) {
        user.annonymousUsername = annonymousUsername,
        user.realFullname = realFullname,
        user.gender = gender,
        user.age = age,
        user.password = password,
        user.refreshToken = refreshToken,
        user.avatar = avatar
        await user.save()
    }
    else {
        throw new ApiError(402, "User's phone number is not verified")
    }

    return res
        .status(200)
        .json(200, {
            ...user,
            accessToken,
            accessTokenExp: 86400000,
            refreshTokenExp: 86400000 * 7
        }, "User has registered successfully")
})

const login = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
        throw new ApiError(401, "Phone number or password is empty")
    }

    const user = await User.findOne({ phone: phoneNumber }).select("-password");
    if(!user) {
        throw new ApiError(402, "Phone number is invalid")
    }
    const isCorrect = await user.isPasswordCorrect(password)

    if(!isCorrect) {
        throw new ApiError(403, "Password is incorrect")
    }

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    user.refreshToken = newRefreshToken;
    await user.save()

    return res
        .status(200)
        .json(200, {
            ...user,
            accessToken,
            accessTokenExp: 86400000,
            refreshTokenExp: 86400000 * 7
        }, "User has logged in successfully")
})

const refreshTokens = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!decodedToken) {
        throw new ApiError(401, "Invalid Refresh Token")
    }

    const user = await User.findById(decodedToken._id)
    if (user.refreshToken != refreshToken) {
        throw new ApiError(402, "Refresh Token does not match")
    }

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    user.refreshToken = newRefreshToken;
    await user.save()

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token has been refreshed"))
})

const checkUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ annonymousUsername: username });

    if(user) {
        return res.status(200).json(new ApiResponse(200, { usernameTaken: true }, "Username is already taken"))
    }
    return res.status(200).json(new ApiResponse(200, { usernameTaken: false }, "Username is unique"))
})

const setIsActive = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    isActive = Boolean(isActive)

    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { isActive } }
    )

    await Forum.updateMany(
        { members: req.user._id },
        { $inc: { totalActive: isActive? 1 : -1 } }
    )

    return res.status(200).send(`isActive is set to ${isActive}`)
})

export {
    sendVerificationCode,
    verifyCode,
    signUp,
    refreshTokens,
    login,
    checkUsername,
    setIsActive
}