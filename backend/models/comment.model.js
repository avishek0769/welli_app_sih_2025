import mongoose, { Schema } from "mongoose"

const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "posts"
    },
    comment: {
        type: String,
        required: true
    },  
    commenter: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    mentioned: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    totalLikes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Comment = mongoose.model("Comment", commentSchema)

export default Comment