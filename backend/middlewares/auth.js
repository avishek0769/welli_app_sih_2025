import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError"
import User from "../models/user.model"

const auth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "")
        if(!token) {
            throw new ApiError(402, "Access Token is not available")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken) {
            throw new ApiError(401, "Invalid Token")
        }

        const user = await User.findById(decodedToken._id)
        if(!user) {
            throw new ApiError(404, "User not found")
        }

        req.user = user
        next()
    }
    catch (error) {
        next(error)
    }
}

export { auth }