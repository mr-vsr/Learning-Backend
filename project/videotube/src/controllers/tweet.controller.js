import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    //steps
    //get the content from the req body
    //check if the content is present or not
    //if present update the database with the tweet
    //return a response

    const { content, name } = req.body
    
    console.log(req.body);

    if (!content) {
        throw new ApiError(400, "Some content is required");
    }

    const tweet = await Tweet.create({
        content:content,
        owner:req.user?._id
    })

    const isTweetCreated = await Tweet.findById(tweet._id);

    if (!isTweetCreated) {
        throw new ApiError(500, "Something went wrong while creating a tweet");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                isTweetCreated,
                "Tweeted successfully"
            )
        );

})

const getUserTweets = asyncHandler(async (req, res) => {
    // steps
    //get hold of the user from the request parameter
    //check if the user exists in the database or not
    //the apply aggregation pipeline on tweets to find all the tweets done by this user
    //return the response

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    try {
        const tweets = await Tweet.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    _id: 0,
                    content: 1
                }
            }
        ]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    tweets,
                    "Tweets fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500,error.message || "Something went wrong with the server")
    }
});


const updateTweet = asyncHandler(async (req, res) => {
    //steps
    //get the id of the tweet from the user, from the parameter
    //check if that tweet exists in the database or not
    //if it exists take the new content from the user in req body
    //update the tweet in the database
    //return the updated tweet

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }

    let tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "The tweet does not exists");
    }

    const { content } = req.body
    
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        {
            new:true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "Tweet updated successfully"
            )
        );

})

const deleteTweet = asyncHandler(async (req, res) => {
    //steps
    //get the tweet id from the req parameter
    //check if the tweet exists in the data base or not
    //if existst delete the tweet and return a response

    const{ tweetId}= req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is missing");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet was deleted successfully"
            )
        );

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}