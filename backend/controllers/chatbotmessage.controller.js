import mongoose from "mongoose"
import ChatbotConversation from "../models/chatbotcoversation.model.js"
import ChatbotMessage from "../models/chatbotmessage.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadToS3 from "../utils/uploadToS3.js"

const createChatbotMessage = asyncHandler(async (req, res) => {
    const { userInput, chatId, _id } = req.body
    
    const chat = await ChatbotConversation.findById(chatId)
    if(chat.user.toString() != req.user._id.toString()) {
        throw new ApiError(402, "This chat does not belong to this user")
    }
    
    const response = await fetch(`${process.env.CHATBOT_API_HOST}/api/chat/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
    })
    if(!response.ok) {
        throw new ApiError(500, "Failed to fetch response from chatbot service")
    }

    const data = await response.json()
    
    const messageData = {
        _id: new mongoose.Types.ObjectId(_id),
        chat: chatId,
        promptText: userInput,
        responseText: data.reply,
    }

    const message = await ChatbotMessage.create(messageData)

    return res.status(200).json(new ApiResponse(200, message, "Chatbot response fetched"))
})

const getAllChats = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 0, limit = 10 } = req.query

    const chat = await ChatbotConversation.findById(chatId)
    if(chat.user.toString() != req.user._id.toString()) {
        throw new ApiError(402, "This chat does not belong to this user")
    }

    const messages = await ChatbotMessage
        .find({ chat: chatId })
        .skip(Number(page) * Number(limit))
        .limit(Number(limit))
        .sort({ timestamp: -1 })

    return res.status(200).json(new ApiResponse(200, messages, "Fetched all chatbot messages for this conversation"))
})

const getAudio = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await ChatbotMessage.findById(messageId)
    const chat = await ChatbotConversation.findById(message.chat)

    if(chat.user.toString() != req.user._id.toString()) {
        throw new ApiError(402, "This message does not belong to this user")
    }

    if(message.responseAudioUrl) {
        return res.status(200).json(new ApiResponse(200, { audioUrl: message.responseAudioUrl }, "Fetched audio for the chatbot message"))
    }

    const response = await fetch(`${process.env.CHATBOT_API_HOST}/api/chat/message-audio`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: message.responseText, messageId })
    })
    if(!response.ok) {
        throw new ApiError(500, "Failed to fetch audio from chatbot service")
    }
    
    const data = await response.json()
    
    message.responseAudioUrl = data.audio_url
    await message.save()

    return res.status(200).json(new ApiResponse(200, { audioUrl: message.responseAudioUrl }, "Fetched audio for the chatbot message"))
})

export {
    createChatbotMessage,
    getAllChats,
    getAudio
}