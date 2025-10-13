import mongoose, { Schema } from "mongoose"

const forumSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    totalActive: {
        type: Number,
        default: 0
    },
    totalPosts: {
        type: Number,
        default: 0
    },
    totalMembers: {
        type: Number,
        default: 0
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }]
})

const Forum = mongoose.model("Forum", forumSchema)

export default Forum