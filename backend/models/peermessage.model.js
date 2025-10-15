import mongoose, { Schema } from "mongoose";

const peerMessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: "peerChats"
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    attachments: [{
        type: String
    }],
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }]
})

const PeerMessage = mongoose.model("PeerMessage", peerMessageSchema)

export default PeerMessage
