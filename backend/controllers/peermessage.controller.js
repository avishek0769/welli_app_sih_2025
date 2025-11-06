import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js";
import PeerMessage from "../models/peermessage.model.js";
import { Queue } from "bullmq";
import PeerChat from "../models/peerchat.model.js";
import { connection } from "../utils/redisClient.js";
import { getIoInstance } from "../utils/socket.js";

/*
1. File uploads -- send attachments
*/

let io;
setTimeout(() => {
    io = getIoInstance();
}, 3000);
const messageQueue = new Queue("peerMessages", { connection })
const messageSeenQueue = new Queue("peerMessagesSeen", { connection })

const handleSendMessage = (socket) => async ({ message, senderId, receiverId, chatId }) => { // TODO: Validation required for correct chatId, senderId, receiverId
    const receiver = await User.findById(receiverId) // TODO: Optimise getting socket ID
    const timestamp = Date.now();

    if (!receiver.socketId) {
        throw new ApiError(401, "Socket ID not present")
    }
    if (receiver.isActive) {
        io.to(receiver.socketId).emit("newMessage", { message, timestamp, chatId, senderId })
    }

    await messageQueue.add("new-message", {
        chat: chatId,
        sender: senderId,
        receiver: receiverId,
        text: message,
        timestamp,
        attachments: [] // Will support in later versions
    })
}

const handleSeenMessages = (socket) => async ({ userId, chatId, receiverId }) => {
    const receiver = await User.findById(receiverId) // TODO: Optimise getting socket ID

    if (!receiver.socketId) {
        throw new ApiError(401, "Socket ID not present")
    }
    if (receiver.isActive) {
        io.to(receiver.socketId).emit("messageSeen", { chatId })
    }

    await messageSeenQueue.add("message-seen", {
        userId, chatId, receiverId
    })
}

const getMessagesByChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 0, limit = 20 } = req.query;

    const chat = await PeerChat.findById(chatId)
    if (!chat || !chat.participants.includes(req.user._id)) {
        throw new ApiError(404, "Chat not found")
    }

    const messages = await PeerMessage
        .find({
            chat: chatId,
            deletedFor: { $nin: [req.user._id] }
        })
        .sort({ timestamp: -1 })
        .skip(Number(page) * Number(limit))
        .limit(Number(limit))

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                messages,
                hasMore: messages.length == limit
            },
            "Messages fetched successfully"
        ))
})

const getUnreadMessageCountByChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await PeerChat.findById(chatId)
    if (!chat || !chat.participants.includes(req.user._id)) {
        throw new ApiError(404, "Chat not found")
    }

    const messageCount = await PeerMessage.find({
        chat: chatId,
        readBy: { $nin: [req.user._id] }
    }).countDocuments()

    return res.status(200).json(new ApiResponse(200, { unreadMessageCount: messageCount }, "No. of unread messages fetched"))
})

const deleteForMe = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await PeerMessage.findById(messageId)
    if (!message) {
        throw new ApiError(404, "Message not found")
    }

    if(message.deletedFor.length && !message.deletedFor.includes(req.user._id.toString())) {
        await PeerMessage.findByIdAndDelete(messageId)
        return res.status(200).send("Deleted the message for me")
    }
    if(message.deletedFor.includes(req.user._id.toString())) {
        throw new ApiError(400, "Message already deleted for me")
    }
    
    await PeerMessage.findByIdAndUpdate(
        messageId,
        { $addToSet: { deletedFor: req.user._id } }
    )

    return res.status(200).send("Deleted the message for me")
})

const deleteForEveryone = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { participantId } = req.query;

    const message = await PeerMessage.findById(messageId)
    if (!message || message.sender.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Message not found")
    }

    await PeerMessage.updateOne(
        { _id: messageId, sender: req.user._id },
        {
            $set: {
                deletedForEveryone: true,
                text: ""
            }
        }
    )

    const participant = await User.findById(participantId) // TODO: Should check whether participant is part of the chat
    if (participant.isActive) {
        io.to(participant.socketId).emit("messageDltForEv", messageId)
    }

    return res.status(200).send("This message is deleted for everyone")
})

const clearChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    
    const chat = await PeerChat.findById(chatId)
    if (!chat || !chat.participants.includes(req.user._id)) {
        throw new ApiError(404, "Chat not found")
    }

    await PeerMessage.updateMany(
        { chat: chatId },
        { $addToSet: { deletedFor: req.user._id } }
    )
    await PeerMessage.deleteMany(
        {
            chat: chatId,
            deletedFor: { $size: chat.participants.length }
        }
    )

    return res.status(200).send("All messages cleared for this chat")
})

export {
    handleSendMessage,
    handleSeenMessages,
    getMessagesByChat,
    getUnreadMessageCountByChat,
    deleteForMe,
    deleteForEveryone,
    clearChat
}