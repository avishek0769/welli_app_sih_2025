import mongoose, { Schema } from 'mongoose';

const PeerChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
        default: []
    }],
    deletedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
        default: []
    }]
});

const PeerChat = mongoose.model('PeerChat', PeerChatSchema);

export default PeerChat;
