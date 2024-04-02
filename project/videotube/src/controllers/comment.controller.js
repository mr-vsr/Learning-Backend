import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, "Video Id is missing");
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    try {
        const pipeline = [
            // Match comments for the given videoId
            {
                $match: {
                    video: mongoose.Types.ObjectId(videoId)
                }
            },
        ];

        // Execute aggregation pipeline
        const comments = await Comment.aggregate(pipeline);

        // Paginate the results
        const startIndex = (pageNumber - 1) * limitNumber;
        const endIndex = pageNumber * limitNumber;
        const paginatedComments = comments.slice(startIndex, endIndex);

        // Return paginated comments
        res.json(new ApiResponse(paginatedComments));
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json(new ApiError("Failed to get video comments"));
    }
});


const addComment = asyncHandler(async (req, res) => {
    //steps
    //get video id from the params
    //get the owner of the comment by using req.user
    //get the content of the comment from request body
    //store in the database
    //return a response

    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400, "Video Id is missing");
    }

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content of the comment is missing");
    }

    const user = await User.findById(req.user?._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video,
        owner: user
    });

    const isCommentCreated = await Comment.findById(comment._id);

    if (!isCommentCreated) {
        throw new ApiError(500, "Something went wrong");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                isCommentCreated,
                "Comment created successfully"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {

    // Steps
    //find the comment id from the parameter
    //get content from the request body
    //update the content
    //return a response

    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Comment Id is missing");
    }

    let comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const { content } = req.body;
    
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    
    // console.log(content)


    comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment updated successfully"
            )
    );
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // steps
    //find the comment by id
    //check if the comment exists
    //if yes then delete it
    //return a response

    const { commentId } = req.params;
    
    if (!commentId) {
        throw new ApiError(400, "Comment Id is missing");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment deleted successfully!"
            )
        );
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}