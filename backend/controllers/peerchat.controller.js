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

    await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { peers: peerId } }
    )

    await PeerChat.create({
        participants: [
            Schema.Types.ObjectId(req.user._id),
            Schema.Types.ObjectId(peerId)
        ],
        lastMessage: null,
    })

    return res.status(200).send("Chat created with the peer and added to your DM")
})

const deleteChat = asyncHandler(async (req, res) => {
    const { peerId } = req.params;

    const peer = await User.findById(peerId)
    const doesIncludeMe = peer.peers.includes(req.user._id)

    if (!doesIncludeMe) {
        const peerChat = await PeerChat.findOneAndDelete({
            participants: { $all: [req.user._id, peerId] }
        })
        await PeerMessage.deleteMany({ chat: peerChat._id })
    }
    
    await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { peers: peerId } }
    )

    return res.status(200).send("Chat deleted successfully")
})

export {
    createChat,
    deleteChat
}