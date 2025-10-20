import { Schema } from "mongoose";
import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import PeerChat from "../models/peerchat.model";
import User from "../models/user.model";
import PeerMessage from "../models/peermessage.model";

/*
1. Feat --> Create groups with peers
*/

const createChat = asyncHandler(async (req, res) => {
    const { peerId } = req.params;

    const peer = await User.findById(peerId)
    if (!peer.acceptMessages) {
        throw new ApiError(401, "User does not accept messages from strangers")
    }

    await PeerChat.create({
        participants: [
            Schema.Types.ObjectId(req.user._id),
            Schema.Types.ObjectId(peerId)
        ],
        lastMessage: null,
    })

    return res.status(200).send("Chat created with the peer")
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const chat = await PeerChat.findById(chatId)

    if(chat.deletedFor.length) {
        await PeerMessage.deleteMany({ chat: chatId })
        await PeerChat.findByIdAndDelete(chatId)
    }
    else {
        await PeerChat.findByIdAndUpdate(
            chatId,
            { $push: { deletedFor: req.user._id } }
        )
        await PeerMessage.updateMany(
            { chat: chat },
            { $push: { deletedFor: req.user._id } }
        )
    }

    return res.status(200).send("Chat deleted successfully")
})

const getChats = asyncHandler(async (req, res) => {
    const chats = await PeerChat.aggregate([
        { $match: { participants: new Schema.Types.ObjectId(req.user._id) } },
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
                from: "peerMessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "peerMessages",
            }
        }
    ])
    
    return res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully"))
})

export {
    createChat,
    deleteChat,
    getChats
}