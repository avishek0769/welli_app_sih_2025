import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError"


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
        req.user = { ...decodedToken }
        next()
    }
    catch (error) {
        next(error)
    }
}

export { auth }