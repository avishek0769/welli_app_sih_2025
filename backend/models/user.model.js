import mongoose, { Schema } from "mongoose";

const usersSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        default: 0
    },
    condition: {
        type: String,
        enum: ['depression', 'anxiety', 'stress', 'bipolar', 'ocd', 'ptsd', 'suicidal', 'none'],
        default: 'none'
    },
    recommendations: {
        type: [
            {
                title: {
                    type: String,
                    required: true
                },
                thumbnail: {
                    type: String,
                    required: true
                },
                link: {
                    type: String,
                    required: true
                }
            }
        ],
        default: []
    },
    forums: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Forums',
        }
    ],
    accessToken: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
})

export const Users = mongoose.model("Users", usersSchema)