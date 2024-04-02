import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    try {
        const userId = req.user?._id;

        // Check if the user is already subscribed to the channel
        const isSubscribed = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $addFields: {
                    isSubscribed: {
                        $in: [userId, "$subscribers.subscriber"]
                    }
                }
            }
        ]);

        // If the user is already subscribed, unsubscribe by removing the subscription
        if (isSubscribed.length > 0 && isSubscribed[0].isSubscribed) {
            await Subscription.deleteOne({ subscriber: userId, channel: channelId });
            res
                .status(200)
                .json(
                    200,
                    new ApiResponse(
                        200,
                        {},
                        "unsubscribed"
                    ));
        } else {
            // If not subscribed, subscribe by adding a new subscription
            await Subscription.create({ subscriber: userId, channel: channelId });
            res
                .status(200)
                .json(
                    200,
                    new ApiResponse(
                        200,
                        {},
                        "subscribed"
                    ));
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// controller to return subscribers list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //steps
    //check if the channel exists or not
    //return the subscriber count 

    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel Id is missing");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel does not exists");
    }

    const subscribers = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Number of subscribers returned successfully"
            )
        );


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params;

    try {
        // Find subscriptions for the given subscriberId
        const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate('channel');

        // Extract channel information from subscriptions
        const subscribedChannels = subscriptions.map(subscription => subscription.channel);

        res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribedChannels,
                    "successfully found the subscribed channels"
            )
        )
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}