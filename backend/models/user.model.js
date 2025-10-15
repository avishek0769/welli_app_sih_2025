import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    realFullname: {
        type: String,
        required: true
    },
    annonymousUsername: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Others", "PNTS"]
    },
    phone: {
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
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    acceptMessages: {
        type: Boolean,
        default: true
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
    forums: [{
        type: Schema.Types.ObjectId,
        ref: 'forums',
    }],
    peers: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
    }],
    refreshToken: {
        type: String,
        default: null
    },
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) next();
    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone,
            annonymousUsername: this.annonymousUsername,
            realFullname: this.realFullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1D" }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7D" }
    )
}

const User = mongoose.model("User", userSchema)

export default User