import mongoose, { Schema } from 'mongoose';

const PeerChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'peerMessages',
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
});

const PeerChat = mongoose.model('PeerChat', PeerChatSchema);

export default PeerChat;
