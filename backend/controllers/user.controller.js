import twilio from "twilio";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import Forum from "../models/forum.model.js";
import AWS from "aws-sdk";
import ChatbotMessage from "../models/chatbotmessage.model.js"

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const client = new twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

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
            annonymousUsername: `user-${Date.now() * Math.floor(Math.random() * 1000)}`,
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

    if (user.otp == Number(code)) {
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

    if (!annonymousUsername || !realFullname || !password || !gender || !age || !phoneNumber) {
        throw new ApiError(401, "All fields are required")
    }

    let user = await User.findOne({ phone: phoneNumber }).select("-password")
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    if (user.isVerified && !user.hasSignedup) {
        user.annonymousUsername = annonymousUsername,
            user.realFullname = realFullname,
            user.gender = gender,
            user.age = age,
            user.password = password,
            user.refreshToken = refreshToken,
            user.avatar = avatar
        user.hasSignedup = true
        await user.save()
    }
    else {
        if (!user.isVerified) throw new ApiError(402, "Phone number is not verified");
        throw new ApiError(403, "User has already signed up with this phone number");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {
            ...user._doc,
            accessToken,
            accessTokenExp: 86400000,
            refreshTokenExp: 86400000 * 7
        }, "User has registered successfully"))
})

const login = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
        throw new ApiError(401, "Phone number or password is empty")
    }

    const user = await User.findOne({ phone: phoneNumber })
    if (!user) {
        throw new ApiError(402, "Phone number is invalid")
    }
    const isCorrect = await user.isPasswordCorrect(password)

    if (!isCorrect) {
        throw new ApiError(403, "Password is incorrect")
    }

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    user.refreshToken = newRefreshToken;
    await user.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {
            ...user._doc,
            password: undefined,
            accessToken,
            accessTokenExp: 86400000,
            refreshTokenExp: 86400000 * 7
        }, "User has logged in successfully"))
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

    if (user) {
        return res.status(200).json(new ApiResponse(200, { usernameTaken: true }, "Username is already taken"))
    }
    return res.status(200).json(new ApiResponse(200, { usernameTaken: false }, "Username is unique"))
})

const setIsActive = asyncHandler(async (req, res) => {
    const { isActive, socketId, status } = req.query;
    const active = isActive === 'true';
    // console.log(status, active)

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                isActive: active,
                socketId: active ? socketId : null
            }
        }
    )

    await Forum.updateMany(
        { members: req.user._id },
        { $inc: { totalActive: active ? 1 : -1 } }
    )

    return res.status(200).send(`isActive is set to ${isActive}`)
})

const createSignedUrl = asyncHandler(async (req, res) => {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
        throw new ApiError(401, "File name or file type is missing")
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    return res.status(200).json(new ApiResponse(200, { signedUrl }, "Signed URL created successfully"))
})

const currentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, user, "Fetched current user"))
})

const videoRecommendation = asyncHandler(async (req, res) => {
    const response = await fetch("http://127.0.0.1:4000/api/v1/chatbot-conversation/latest?page=0&limit=5", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${req.headers.authorization.split(" ")[1]}`,
            'Content-Type': 'application/json'
        }
    });

    let userQuery = ""
    const chatbotMessages = await response.json();
    chatbotMessages.data.messages.map(message => {
        userQuery += message.promptText
    })

    if (!userQuery.trim()) {
        throw new ApiError(400, "Not enough data to generate recommendations")
    }

    const pythonApiUrl = `${process.env.VIDEO_RECOMMENDER_API_HOST}/api/recommend-videos`;

    const resp = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userQuery: userQuery })
    });

    const data = await resp.json();

    if (!data.success) {
        throw new Error(data.error || "Failed to get recommendations from Python service");
    }

    return res.status(200).json(new ApiResponse(200, data.videos, "Video recommendations fetched successfully"));
})

export {
    sendVerificationCode,
    verifyCode,
    signUp,
    refreshTokens,
    login,
    checkUsername,
    setIsActive,
    createSignedUrl,
    currentUser,
    videoRecommendation
}