import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import PeerChat from "../models/peerchat.model";
import User from "../models/user.model";
import PeerMessage from "../models/peermessage.model";


const handleSendMessage = (socket) => (message, senderId) => {
    socket
}

export {
    handleSendMessage
}