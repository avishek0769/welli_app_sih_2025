import Comment from "../models/comment.model";
import Like from "../models/like.model";
import Post from "../models/post.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";


const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    await Like.create({
        postId,
        likedBy: req.user._id,
        commentId: null
    })

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { totalLikes } }
    )

    return res.status(200).send("Liked the post successfully!")
})

const unlikePost = asyncHandler(async (req, res) => {
    const { likeId, postId } = req.params;

    await Like.findByIdAndDelete({ likeId })

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { totalLikes: -1 } }
    )

    return res.status(200).send("Unliked the post successfully!")
})

const likeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    await Like.create({
        commentId,
        likedBy: req.user._id,
        commentId: null
    })

    await Comment.findByIdAndUpdate(
        commentId,
        { $inc: { totalLikes } }
    )

    return res.status(200).send("Liked the comment successfully!")
})

const unlikeComment = asyncHandler(async (req, res) => {
    const { likeId, commentId } = req.params;

    await Like.findByIdAndDelete({ likeId })

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