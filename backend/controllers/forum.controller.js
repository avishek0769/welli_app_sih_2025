import Forum from "../models/forum.model"
import asyncHandler from "../utils/asyncHandler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import { User } from "../models/user.model"
import { Schema } from "mongoose"

/*
1. Remove the header from this screen.
2. Show the forum name header.
3. Cliking the header the total members will be shown, desc.
4. No Forums will be suggested, just show all.
*/


const createForum = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    await Forum.create({ name, description })

    return res.status(200).send("Forum created")
})

const joinForum = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    
    await Forum.findByIdAndUpdate(
        forumId,
        {
            $addToSet: { members: req.user._id },
            $inc: { totalMembers }
        }
    )

    await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { forums: forumId } }
    )

    return res.status(200).send("User successfully joined the forum")
})

const leaveForum = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    
    await Forum.findByIdAndUpdate(
        forumId,
        { $pull: { members: req.user._id } }
    )

    await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { forums: forumId } }
    )

    return res.status(200).send("User successfully left the forum")
})

const getForumMembers = asyncHandler(async (req, res) => {
    const { forumId } = req.params;

    const forum = await Forum.aggregate([
        {
            $match: { _id: new Schema.Types.ObjectId(forumId) }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "members",
                as: "members",
                pipeline: [
                    {
                        $project: {
                            annonymousUsername: 1,
                            avatar: 1,
                            isActive: 1
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, forum[0], "Fetched forum menbers and other info"))
})

const getForumDetails = asyncHandler(async (req, res) => {
    const { forumId } = req.params;
    const forum = await Forum.findById(forumId).select("-members")

    return res.status(200).json(new ApiResponse(200, forum, "Fetched forum details"))
})

export {
    createForum,
    joinForum,
    leaveForum,
    getForumMembers,
    getForumDetails
}