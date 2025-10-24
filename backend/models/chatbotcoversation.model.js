import mongoose, { Schema } from "mongoose";

const chatbotConversationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
})

const ChatbotConversation = mongoose.model("ChatbotConversation", chatbotConversationSchema)

export default ChatbotConversation