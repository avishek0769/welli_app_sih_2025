import twilio from "twilio";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import Forum from "../models/forum.model.js";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import ChatbotMessage from "../models/chatbotmessage.model.js"
import ChatbotConversation from "../models/chatbotcoversation.model.js";

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
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
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        throw new ApiError(401, "Username/Phone number or password is empty")
    }

    const user = await User.findOne({
        $or: [
            { phone: identifier },
            { annonymousUsername: identifier }
        ]
    })
    if (!user) {
        throw new ApiError(402, "Invalid credentials")
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
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json(new ApiResponse(200, { signedUrl }, "Signed URL created successfully"))
})

const currentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(new ApiResponse(200, user, "Fetched current user"))
})

const videoRecommendation = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    // 1. Check if within 1 hour
    if (user.lastRecommendationTime) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (user.lastRecommendationTime > oneHourAgo && user.recommendations && user.recommendations.length > 0) {
            return res.status(200).json(new ApiResponse(200, user.recommendations, "Video recommendations fetched from cache"));
        }
    }

    // 2. Fetch chatbot messages to build query
    const latestChatbotConversation = await ChatbotConversation.findOne({ user: req.user._id }).sort({ timestamp: -1 });
    if (!latestChatbotConversation) {
        return res.status(200).json(new ApiResponse(200, user.recommendations || [], "No recent chat history to generate new recommendations"));
    }

    let chatId = latestChatbotConversation._id;
    const chatbotMessages = await ChatbotMessage.find({ chat: chatId })
    .sort({ timestamp: -1 })
    .limit(5);

    let userQuery = ""
    if(chatbotMessages && chatbotMessages.length > 0) {
        chatbotMessages.map(message => {
            userQuery += message.promptText
            userQuery += " "
        })
    }
    
    if (!userQuery.trim()) {
        return res.status(200).json(new ApiResponse(200, user.recommendations || [], "No recent chat history to generate new recommendations"));
    }
    
    // 3. Check relevance
    const relevanceResponse = await fetch(`${process.env.CHATBOT_API_HOST}/api/chat/check-relevance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQuery })
    });
    
    const relevanceData = await relevanceResponse.json();
    const isRelevant = relevanceData.reply && relevanceData.reply.includes('yes');
    
    if (!isRelevant) {
        return res.status(200).json(new ApiResponse(200, user.recommendations || [], "Query not relevant to mental health, returning cached/empty"));
    }

    // 4. Fetch recommendations
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
        return res.status(200).json(new ApiResponse(200, user.recommendations || [], "Failed to fetch new recommendations, returning cached"));
    }

    // 5. Update user model
    const newRecommendations = data.videos.map(v => ({
        title: v.title,
        thumbnail: v.thumbnail,
        url: v.url,
        channel: v.channel,
        duration: v.duration,
        views: v.views
    }));
    
    user.recommendations = newRecommendations;
    user.lastRecommendationTime = new Date();
    await user.save();

    return res.status(200).json(new ApiResponse(200, newRecommendations, "Video recommendations fetched successfully"));
})

const logout = asyncHandler(async (req, res) => {
    const user = req.user;
    user.refreshToken = null;
    user.isActive = false;
    user.socketId = null;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "User has been logged out successfully"));
})

const updateAvatar = asyncHandler(async (req, res) => {
    const { avatar } = req.body;
    if (!avatar) throw new ApiError(400, "Avatar URL is required");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const toggleAcceptMessages = asyncHandler(async (req, res) => {
    const { acceptMessages } = req.body;
    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { acceptMessages } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Settings updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
    // const userId = req.user._id;
    // await User.findByIdAndDelete(userId);
    return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));
});

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
    videoRecommendation,
    logout,
    updateAvatar,
    toggleAcceptMessages,
    deleteAccount
}