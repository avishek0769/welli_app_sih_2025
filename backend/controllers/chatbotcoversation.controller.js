import ChatbotConversation from "../models/chatbotcoversation.model"
import ChatbotMessage from "../models/chatbotmessage.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";


const createChatbotConversation = asyncHandler(async (req, res) => {
    const { userInput } = req.body;

    // const response = await fetch("/api/python-service", {
    //     method: "POST",
    //     body: JSON.stringify({ userInput })
    // })
    // const data = await response.json()
    const data = { title: "New Chat" }

    await ChatbotConversation.create({
        title: data.title,
        user: req.user._id
    })

    return res.status(200).send("New Chatbot Conversation created")
})

const getAllConversation = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    const chats = await ChatbotConversation
        .find({ user: req.user._id })
        .skip(Number(page) * Number(limit))
        .limit(Number(limit))
        .sort({ lastUpdated: 1 })

    return res.status(200).json(new ApiResponse(200, chats, "Fetched all chatbot conversations for this user"))
})

const deleteConversation = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await ChatbotConversation.findById(chatId)
    if(chat.user != req.user._id) {
        throw new ApiError(402, "User is not the creator of this conversation")
    }

    await ChatbotMessage.deleteMany({ chat: chatId })
    await ChatbotConversation.findByIdAndDelete(chatId)

    return res.status(200).send("Successfully deleted chatbot conversation")
})

const updateTitle = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { title } = req.body;

    await ChatbotConversation.findByIdAndUpdate(
        chatId,
        { title }
    )

    return res.status(200).send("Updated the title of the chatbot conversation")
})

const mostRecentChat = asyncHandler(async (req, res) => {
    const { page = 0, limit = 20 } = req.query;

    const chat = await ChatbotConversation.findOne({ user: req.user._id }).sort({ lastUpdated: 1 })

    const messages = await ChatbotMessage
        .find({ chat: chat._id })
        .sort({ timestamp: 1 })
        .skip(Number(page) * Number(limit))
        .limit(Number(limit))

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                messages,
                chat
            },
            "Recent Chatbot Conversation with messages fetched successfully"
        ))
})

export {
    createChatbotConversation,
    getAllConversation,
    deleteConversation,
    updateTitle,
    mostRecentChat
}