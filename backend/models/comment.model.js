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
    }
}, { timestamps: true })

const Comment = mongoose.model("Comment", commentSchema)

export default Comment