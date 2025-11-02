import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import Post from "../models/post.model.js";
import Forum from "../models/forum.model.js";
import mongoose from "mongoose"


const createPost = asyncHandler(async (req, res) => {
    const { text, imageUrl, forumId } = req.body;

    await Post.create({
        text,
        image: imageUrl,
        createdBy: req.user._id,
        forumId,
    })
    await Forum.findByIdAndUpdate(
        forumId,
        { $inc: { totalPosts } }
    )

    return res.status(200).send("Post created successfully!")
})

const editPost = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId)

    if(post.createdBy != req.user._id) {
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

    if(post.createdBy != req.user._id) {
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

export {
    createPost,
    editPost,
    deletePost,
    getAllPosts
}