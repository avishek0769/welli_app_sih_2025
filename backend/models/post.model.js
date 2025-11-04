import mongoose, { Schema } from "mongoose"

const postSchema = new Schema({
    forumId: {
        type: Schema.Types.ObjectId,
        ref: "forums"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    totalComment: {
        type: Number,
        required: true,
        default: 0
    },
    totalLikes: {
        type: Number,
        required: true,
        default: 0
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    unseenBy: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const Post = mongoose.model("Post", postSchema)

export default Post