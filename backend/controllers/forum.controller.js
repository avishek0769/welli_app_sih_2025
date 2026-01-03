import Forum from "../models/forum.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
import mongoose from "mongoose"

/*
1. Remove the header from this screen.
2. Show the forum name header.
3. Cliking the header the total members will be shown, desc.
4. No Forums will be suggested, just show all.
5. Unseen posts count for each forum.
6. Frontend -> Differentiate sections for peers and forums
*/


const createForum = asyncHandler(async (req, res) => {
    const { name, description, password } = req.body

    if (password != "iamadmin") {
        throw new ApiError(403, "You are not authorized to create a forum")
    }
    const newForum = await Forum.create({ name, description })

    return res.status(200).json(new ApiResponse(200, newForum, "Forum created successfully"))
})

const getAllForums = asyncHandler(async (req, res) => {
    const { page = 0, limit = 10 } = req.query;

    const forums = await Forum.aggregate([
        {
            $match: {
                members: { $not: { $in: [new mongoose.Types.ObjectId(req.user._id)] } }
            }
        },
        {
            $addFields: {
                totalMembers: { $size: "$members" }
            }
        },
        {
            $sort: { totalMembers: -1 }
        },
        {
            $project: {
                members: 0
            }
        },
        {
            $skip: parseInt(page) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    return res.status(200).json(new ApiResponse(200, forums, "Fetched all forums"))  
})

const searchForums = asyncHandler(async (req, res) => {
    const { q, page = 0, limit = 10 } = req.query;

    const forums = await Forum.aggregate([
        {
            $match: {
                name: { $regex: q, $options: "i" }
            }
        },
        {
            $addFields: {
                totalMembers: { $size: "$members" }
            }
        },
        {
            $project: {
                members: 0
            }
        },
        {
            $skip: parseInt(page) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    return res.status(200).json(new ApiResponse(200, forums, "Fetched searched forums"))
})

const joinForum = asyncHandler(async (req, res) => {
    const { forumId } = req.params;

    await Forum.findByIdAndUpdate(
        forumId,
        {
            $addToSet: { members: req.user._id }
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
        {
            $pull: { members: req.user._id }
        }
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
            $match: { _id: new mongoose.Types.ObjectId(forumId) }
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
    const forum = await Forum.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(forumId) }
        },
        {
            $addFields: {
                totalMembers: { $size: "$members" }
            }
        },
        {
            $project: {
                members: 0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, forum[0], "Fetched forum details"))
})

const joinedForums = asyncHandler(async (req, res) => {
    const forums = await Forum.aggregate([
        {
            $match: { members: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "posts",
                let: { forumId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$forumId", "$$forumId"] },
                                    { $in: [new mongoose.Types.ObjectId(req.user._id), "$unseenBy"] }
                                ]
                            }
                        }
                    },
                    {
                        $count: "unseenPostCount"
                    }
                ],
                as: "unseenPost"
            }
        },
        {
            $addFields: {
                unseenCount: {
                    $ifNull: [{ $arrayElemAt: ["$unseenPost.unseenPostCount", 0] }, 0]
                },
                totalMembers: { $size: "$members" }
            }
        },
        {
            $project: {
                members: 0,
                unseenPost: 0
            }
        },
        { $sort: { lastUpdated: -1 } }
    ])

    return res.status(200).json(new ApiResponse(200, forums, "Fetched all forums of current user"))
})

export {
    createForum,
    joinForum,
    leaveForum,
    getForumMembers,
    getForumDetails,
    joinedForums,
    getAllForums,
    searchForums
}