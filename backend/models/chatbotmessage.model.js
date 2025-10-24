import mongoose, { Schema } from "mongoose";

const chatbotMessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: "chatbotConversations"
    },
    promptText: {
        type: String,
        required: true
    },
    promptAudioUrl: {
        type: String,
    },
    responseText: {
        type: String,
        required: true
    },
    responseAudioUrl: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const ChatbotMessage = mongoose.model("ChatbotMessage", chatbotMessageSchema)

export default ChatbotMessage