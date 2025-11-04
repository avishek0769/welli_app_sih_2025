import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Post from "../models/post.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const likeExists = await Like.findOne({ postId, likedBy: req.user._id });
    if (likeExists) {
        throw new ApiError(400, "Post already liked");
    }

    await Like.create({
        postId,
        likedBy: req.user._id,
        commentId: null
    })

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { totalLikes: 1 } }
    )

    return res.status(200).send("Liked the post successfully!")
})

const unlikePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const likeDeleted = await Like.deleteOne({
        postId,
        likedBy: req.user._id
    })
    if(likeDeleted.deletedCount === 0) {
        throw new ApiError(404, "Like not found")
    }

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { totalLikes: -1 } }
    )

    return res.status(200).send("Unliked the post successfully!")
})

const likeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    
    const likeExists = await Like.findOne({ commentId, likedBy: req.user._id });
    if (likeExists) {
        throw new ApiError(400, "Comment already liked");
    }

    await Like.create({
        commentId,
        likedBy: req.user._id,
        postId: null
    })

    await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { totalLikes: 1 } }
    )

    return res.status(200).send("Liked the comment successfully!")
})

const unlikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const likeDeleted = await Like.deleteOne({
        commentId,
        likedBy: req.user._id
    })
    if(likeDeleted.deletedCount === 0) {
        throw new ApiError(404, "Like not found")
    }

    await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { totalLikes: -1 } }
    )

    return res.status(200).send("Unliked the comment successfully!")
})

const getAllPostLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const likes = await Like.find({ postId }).countDocuments()

    return res.status(200).json(new ApiResponse(200, { likes }, "Post Likes fetched successfully"))
})

const getAllCommentLikes = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const likes = await Like.find({ postId }).countDocuments()

    return res.status(200).json(new ApiResponse(200, { likes }, "Comment Likes fetched successfully"))
})

export {
    likePost,
    unlikePost,
    likeComment,
    unlikeComment,
    getAllPostLikes,
    getAllCommentLikes
}