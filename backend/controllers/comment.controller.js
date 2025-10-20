import mongoose from "mongoose";
import Comment from "../models/comment.model";
import Post from "../models/post.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

/*
1. Add mention option in commenting
*/

const createComment = asyncHandler(async (req, res) => {
    const { comment, postId, mentionedUserId } = req.body;
    
    if(!comment || !postId) {
        throw new ApiError(400, "Comment or Post ID is missing");
    }

    await Comment.create({
        comment,
        commenter: req.user._id,
        mentioned: mentionedUserId,
        postId
    })

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { totalComment } }
    )

    return res.status(200).send("Comment added to the post")
})

const editComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (existingComment.commenter != req.user._id) {
        throw new ApiError(403, "You are not authorized to edit this comment");
    }

    existingComment.comment = comment;
    await existingComment.save();

    return res.status(200).send("Comment updated successfully");
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (existingComment.commenter != req.user._id) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await existingComment.remove();

    await Post.findByIdAndUpdate(
        existingComment.postId,
        { $inc: { totalComment: -1 } }
    )

    return res.status(200).send("Comment deleted successfully");
})

const getAllComments = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    
    const comments = await Comment.aggregate([
        { $match: { postId: new mongoose.Types.ObjectId(postId) } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "commenter",
                foreignField: "_id",
                as: "commenter",
                pipeline: [{ $project: { annonymousUsername: 1, avatar: 1 } }]
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
})

export {
    createComment,
    editComment,
    deleteComment,
    getAllComments
}