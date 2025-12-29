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
    
    const chat = await PeerChat.findOne({
        participants: { $all: [req.user._id, peerId] }
    })
    if (chat) {
        throw new ApiError(400, "Chat already exists")
    }

    const peerChat = await PeerChat.create({
        participants: [
            req.user._id,
            new mongoose.Types.ObjectId(peerId)
        ],
    })

    return res.status(200).json(new ApiResponse(200, peerChat, "Chat created successfully"))
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const chat = await PeerChat.findById(chatId);
    
    const userId = req.user._id.toString();
    const participantId = chat.participants.find(id => id.toString() != userId).toString();

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }
    if (!chat.participants.map(id => id.toString()).includes(userId)) {
        throw new ApiError(403, "Not authorized to delete this chat");
    }
    
    const messagesCountOfPart = await PeerMessage.countDocuments({
        chat: chatId,
        deletedFor: { $nin: [participantId] }
    });
    const alreadyDeletedForPart = chat.deletedFor.includes(participantId);

    if (alreadyDeletedForPart && messagesCountOfPart === 0) {
        await PeerMessage.deleteMany({ chat: chatId });
        await PeerChat.findByIdAndDelete(chatId);
        return res.status(200).send("Chat deleted successfully");
    }
    if(alreadyDeletedForPart) {
        await PeerChat.findByIdAndUpdate(chatId, {
            $pull: { deletedFor: participantId }
        });
    }

    await PeerChat.findByIdAndUpdate(chatId, {
        $addToSet: { deletedFor: userId },
    });

    await PeerMessage.updateMany(
        { chat: chatId },
        { $addToSet: { deletedFor: userId } }
    );    

    await PeerMessage.deleteMany({
        chat: chatId,
        $expr: { $eq: [{ $size: "$deletedFor" }, 2] }
    })

    return res.status(200).send("Chat deleted successfully");
});

const restoreChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user._id;

    await PeerChat.findByIdAndUpdate(chatId, {
        $pull: { deletedFor: userId }
    });

    return res.status(200).send("Chat restored successfully");
});


const getChats = asyncHandler(async (req, res) => {
    const chats = await PeerChat.aggregate([
        { $match: { participants: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: "users",
                let: { participantIds: "$participants", currentUser: new mongoose.Types.ObjectId(req.user._id) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$participantIds"] },
                                    { $ne: ["$_id", "$$currentUser"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            annonymousUsername: 1,
                            avatar: 1
                        }
                    }
                ],
                as: "participant",
            }
        },
        {
            $lookup: {
                from: "peermessages",
                let: { chatId: "$_id", currentUser: new mongoose.Types.ObjectId(req.user._id) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$chat", "$$chatId"] },
                                    { $not: { $in: ["$$currentUser", "$deletedFor"] } }
                                ]
                            },
                        }
                    },
                    { $sort: { timestamp: -1 } },
                    { $limit: 1 }
                ],
                as: "lastMessages",
            }
        },
        {
            $addFields: {
                lastMessage: { $arrayElemAt: ["$lastMessages", 0] }
            }
        },
        {
            $lookup: {
                from: "peermessages",
                let: { chatId: "$_id", currentUser: new mongoose.Types.ObjectId(req.user._id) },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$chat", "$$chatId"] },
                                    { $not: { $in: ["$$currentUser", "$readBy"] } },
                                    { $not: { $in: ["$$currentUser", "$deletedFor"] } }
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
        {
            $addFields: {
                participant: { $arrayElemAt: ["$participant", 0] }
            }
        },
        {
            $project: {
                unreadMessages: 0,
                lastMessages: 0,
                participants: 0,
            }
        },
        { $sort: { "lastMessage.timestamp": -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, chats, "Chats fetched successfully"))
})

export {
    createChat,
    deleteChat,
    getChats,
    restoreChat
}