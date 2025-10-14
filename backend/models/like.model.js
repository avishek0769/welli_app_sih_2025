import mongoose, { Schema } from "mongoose"

const likeSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: "posts"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "comments"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
})

const Like = mongoose.model("Like", likeSchema)

export default Like