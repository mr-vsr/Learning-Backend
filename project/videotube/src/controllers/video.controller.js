import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary,deleteFromCloduinary } from "../utils/cloudinary.js";
import { getPublicId } from "../utils/getPublicId.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Match stage to filter videos based on user ID if provided
    const matchStage = userId ? { $match: { owner: mongoose.Types.ObjectId(userId) } } : { $match: {} };

    // Sorting stage based on sortBy and sortType
    const sortStage = sortBy ? { $sort: { [sortBy]: sortType === 'desc' ? -1 : 1 } } : { $sort: { createdAt: -1 } };

    // Pagination stage
    const skip = (page - 1) * limit;
    const paginationStage = { $skip: skip };
    const limitStage = { $limit: parseInt(limit) };

    // Aggregation pipeline
    const aggregationPipeline = [
        matchStage,
        sortStage,
        paginationStage,
        limitStage
    ];

    // Perform aggregation
    const videos = await Video.aggregate(aggregationPipeline);

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "successfully retrieved videos uploaded by that user"
            ));
});


const publishAVideo = asyncHandler(async (req, res) => {
    //steps:
    //get hold of the title and description of the video for req body
    //get the video and thumbnails from multer
    //upload video on cloudinary server
    //unlink the video and thumbnail from local server after successfull upload on cluodinary server
    //upload the title and description to database along with the url of the thumbnail and video in the database

    const { title, description } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    if (!description) {
        throw new ApiError(400, "Description is required");
    }
    
    // console.log(req.files?.videoFile[0]?.path);

    const localPathOfVideoFile = req.files?.videoFile[0]?.path;
    const localPathOfThumbnail = req.files?.thumbnail[0]?.path;
    
    if (!localPathOfVideoFile) {
        throw new ApiError(400, "Video file is missing (multer)");
    }
    
    if (!localPathOfThumbnail) {
        throw new ApiError(400, "Thumbnail is missing  (multer)");
    }

    const videoFile = await uploadOnCloudinary(localPathOfVideoFile);

    if (!videoFile) {
        throw new ApiError(400, "Error while uploading Video File  on cloudinary ");
    }

    const thumbnail = await uploadOnCloudinary(localPathOfThumbnail);

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading Thumbnail to cloudinary");
    }

    // console.log(videoFile);
    // console.log(thumbnail);
    // console.log(req.user);

    //creating a new entry into the Video collection in the database

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner:req.user
    })

    const isVideoCreated = await Video.findById(video._id);

    if (!isVideoCreated) {
        throw new ApiError(500, "Something went wrong while uploading the video");
    }

    //Sending a response after video upload

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                isVideoCreated,
                "Video uploaded successfully"
            )
        );

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    //steps
    //check if the videoId is provided by the user or not
    //check in the database if that video with the Id exists or not
    //if it exists return that particular video

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "videoId is missing");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
    );
    
})

const updateVideo = asyncHandler(async (req, res) => {

    //steps
    //check if the video Id is provided by the user or not
    //update the value of the fields in the database
    //return the updated response
    
    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400, "Video Id is required");
    }

    let video = await Video.findById(videoId);

    const publicIdThumbnail = getPublicId(video.thumbnail);
    
    
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const localPathOfThumbnail = req.file?.path;

    if (!localPathOfThumbnail) {
        throw new ApiError(400,"Thumbnail path is required")
    }

    const thumbnail = await uploadOnCloudinary(localPathOfThumbnail);

    if (!thumbnail) {
        throw new ApiError(500,"Error occurred while uploading the thumbnail")
    }

    await deleteFromCloduinary(publicIdThumbnail, 'image');

    video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video details updated successfully"
            )
        );

})

const deleteVideo = asyncHandler(async (req, res) => {
    //steps
    //check if the video id is provided by the user
    //find if the video exists with the specified id
    //delete the video from the database
    //delete the video and thumbnail from the cloudinary server

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video Id is missing");
    }

    const video = await Video.findById(videoId);
    
    const thumbnailUrl = video.thumbnail;
    const videoUrl = video.videoFile;

    const publicIdThumbnail = getPublicId(thumbnailUrl);
    const publicIdVideo = getPublicId(videoUrl);


    await Video.findByIdAndDelete(videoId);

    await deleteFromCloduinary(publicIdVideo,'video');
    await deleteFromCloduinary(publicIdThumbnail,'image');

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        );

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    //steps
    //check if the video id is provided by the user or not
    //check if the video id exists in the database or not
    //if it exist then change the publicsh field to !publish

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video Id is missing");
    }

    let video = await Video.findById(videoId);
    const isPublishedPreviousValue = video.isPublished;

    video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
            isPublished: !isPublishedPreviousValue
            }
        },
        {
            new:true
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Publishing field updated successfully"
            )
        );


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}