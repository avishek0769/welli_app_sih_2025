import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import Post from "../models/post.model.js";
import Forum from "../models/forum.model.js";
import mongoose from "mongoose"


const createPost = asyncHandler(async (req, res) => {
    const { text, imageUrl, forumId } = req.body;

    const post = new Post({
        text,
        image: imageUrl,
        createdBy: req.user._id,
        forumId,
        unseenBy: []
    })

    await Forum.findByIdAndUpdate(
        forumId,
        {
            $inc: { totalPosts: 1 },
            $set: { lastUpdated: Date.now() }
        }
    )

    const forumMembers = await Forum.aggregate([
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
                    { $match: { isActive: true } },
                    { $project: { socketId: 1 } }
                ]
            }
        }
    ])

    post.unseenBy = forumMembers[0].members.map(member => member._id);
    await post.save();

    forumMembers[0].members.forEach(member => {
        if (member.socketId) {
            io.to(member.socketId).emit("newPost", { forumId })
        }
    })

    return res.status(200).send("Post created successfully!")
})

const editPost = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId)

    if (post.createdBy != req.user._id) {
        throw new ApiError(403, "You are not authorized to edit this post");
    }
    post.text = text;
    await post.save();

    return res.status(200).send("Post edited successfully!")
})

const deletePost = asyncHandler(async (req, res) => {
    const { forumId } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId)

    if (post.createdBy != req.user._id) {
        throw new ApiError(403, "You are not authorized to delete this post");
    }
    await Post.findByIdAndDelete(postId)

    await Forum.findByIdAndUpdate(
        forumId,
        { $inc: { totalPosts: -1 } }
    )

    return res.status(200).send("Post deleted successfully!")
})

const getAllPosts = asyncHandler(async (req, res) => {
    const { forumId } = req.params;

    const posts = await Post.aggregate([
        { $match: { forumId: new mongoose.Types.ObjectId(forumId) } },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "createdBy",
                as: "createdBy",
                pipeline: [
                    {
                        $project: {
                            annonymousUsername: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, posts, "All posts are fetched succesfully"))
})

const unseenPostCountByUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const forums = await Post.aggregate([
        { $match: { unseenBy: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$forumId",
                count: { $sum: 1 }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, forums, "Unseen post count fetched successfully"))
})

export {
    createPost,
    editPost,
    deletePost,
    getAllPosts,
    unseenPostCountByUser
}