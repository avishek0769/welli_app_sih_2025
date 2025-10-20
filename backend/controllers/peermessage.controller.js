import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import User from "../models/user.model";
import PeerMessage from "../models/peermessage.model";

/*
1. File uploads -- send attachments
*/

const handleSendMessage = (socket) => async ({ message, timestamp, receiverId }) => {
    const user = await User.findById(receiverId)
    if (!user.socketId) {
        throw new ApiError(401, "Socket id is not present")
    }
    if (user.isActive) {
        socket.to(user.socketId).emit("newMessage", { message, timestamp })
    }

}

const getMessagesByChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const { page = 0, limit = 20 } = req.query;

    const messages = await PeerMessage
        .find({ chat: chatId })
        .sort({ timestamp: 1 })
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

const deleteForMe = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    await PeerMessage.findByIdAndUpdate(
        messageId,
        { $push: { deletedFor: req.user._id } }
    )
    return res.status(200).send("Deleted the message for me")
})

const clearChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    await PeerMessage.updateMany(
        { chat: chatId },
        { $push: { deletedFor: req.user._id } }
    )
    return res.status(200).send("All messages cleared for this chat")
})

export {
    handleSendMessage,
    deleteForMe,
    clearChat,
    getMessagesByChat
}