import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import PeerChat from "../models/peerchat.model.js";
import User from "../models/user.model.js";
import PeerMessage from "../models/peermessage.model.js";

/*
1. Feat --> Create groups with peers
*/

const createChat = asyncHandler(async (req, res) => {
    const { peerId } = req.params;

    const peer = await User.findById(peerId)
    if (!peer.acceptMessages) {
        throw new ApiError(401, "User does not accept messages from strangers")
    }

    const peerChat = await PeerChat.create({
        participants: [
            new mongoose.Types.ObjectId(req.user._id),
            new mongoose.Types.ObjectId(peerId)
        ],
        lastMessage: null,
    })

    return res.status(200).json(new ApiResponse(200, peerChat, "Chat created successfully"))
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const messages = await PeerMessage.countDocuments({ chat: chatId })

    if(messages === 0) {
        const chat = await PeerChat.findByIdAndDelete(chatId)
        if(!chat) {
            throw new ApiError(404, "Chat not found")
        }
        return res.status(200).send("Chat deleted successfully")
    }

    const chat = await PeerChat.findById(chatId)

    if (chat.deletedFor.length && chat.participants.includes(req.user._id.toString())) {
        await PeerMessage.deleteMany({ chat: chatId })
        const deletedChat = await PeerChat.findByIdAndDelete(chatId)
        if(!deletedChat) {
            throw new ApiError(404, "Chat not found")
        }
    }
    else if(chat.participants.includes(req.user._id.toString())) {
        const updatedChat = await PeerChat.findByIdAndUpdate(
            chatId,
            { $addToSet: { deletedFor: req.user._id } }
        )
        if(!updatedChat) {
            throw new ApiError(404, "Chat not found")
        }
        await PeerMessage.updateMany(
            { chat: chat._id },
            { $addToSet: { deletedFor: req.user._id } }
        )
    }

    return res.status(200).send("Chat deleted successfully")
})

const getChats = asyncHandler(async (req, res) => {
    const chats = await PeerChat.aggregate([
        { $match: { participants: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            annonymousUsername: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "peermessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
            }
        },
        {
            $unwind: {
                path: "$lastMessage",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "peermessages",
                let: { chatId: "$_id", currentUser: req.user._id },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$chat", "$$chatId"] },
                                    { $not: { $in: ["$$currentUser", "$readBy"] } }
                                ]
                            }
                        },
                    },
                    { $count: "unreadCount" }
                ],
                as: "unreadMessages"
            }
        },
        {
            $addFields: {
                unreadCount: {
                    $ifNull: [{ $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 0]
                }
            }
        },
        { $project: { unreadMessages: 0 } },
        { $sort: { "lastmessage.timestamp": -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully"))
})

export {
    createChat,
    deleteChat,
    getChats
}