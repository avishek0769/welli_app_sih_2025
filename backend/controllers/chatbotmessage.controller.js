import ChatbotConversation from "../models/chatbotcoversation.model"
import ChatbotMessage from "../models/chatbotmessage.model"
import ApiError from "../utils/ApiError"
import ApiResponse from "../utils/ApiResponse"
import uploadToS3 from "../utils/uploadToS3"

const createChatbotMessage = asyncHandler(async (req, res) => {
    const { userInput, chatId } = req.body

    const chat = await ChatbotConversation.findById(chatId)
    if(chat.user != req.user._id) {
        throw new ApiError(402, "This chat does not belong to this user")
    }

    const response = await fetch(`/api/chat/${chatId}/message`, {
        method: "POST",
        body: JSON.stringify({ message: userInput })
    })
    const data = await response.json()

    await ChatbotMessage.create({
        chat: chatId,
        promptText: userInput,
        responseText: data.reply,
    })

    return res.status(200).json(new ApiResponse(200, data, "Chatbot response fetched"))
})

const getAllChats = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 0, limit = 10 } = req.query

    const chat = await ChatbotConversation.findById(chatId)
    if(chat.user != req.user._id) {
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
    if(chat.user != req.user._id) {
        throw new ApiError(402, "This message does not belong to this user")
    }

    if(message.responseAudioUrl) {
        return res.status(200).json(new ApiResponse(200, { audioUrl: message.responseAudioUrl }, "Fetched audio for the chatbot message"))
    }

    const response = await fetch("/api/chat/message-audio", {
        method: "POST",
        body: JSON.stringify({ text: message.responseText })
    })
    const blob = await response.blob()
    const audioBuffer = await blob.arrayBuffer()

    // Upload to aws
    const audioUrl = await uploadToS3(audioBuffer, `chatbot-messages/${messageId}.mp3`, "audio/mpeg")

    message.responseAudioUrl = audioUrl
    await message.save()

    return res.status(200).json(new ApiResponse(200, data, "Fetched audio for the chatbot message"))
})

export {
    createChatbotMessage,
    getAllChats,
    getAudio
}