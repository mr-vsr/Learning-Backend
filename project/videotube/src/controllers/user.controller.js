import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // console.log(req.body);

    const { email, username, fullName, password } = req.body

    if ([email, username, fullName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Fields cann't be left empty");
    }

    //Checking in the database whether or not user already exists based on username and email entered by the user
    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExists) {
        throw new ApiError(409, "Username or email already exits!");
    }

    // console.log(req.file);

    //Now getting the local path of the images uploaded by the user
    const avatarLocalPath = req.files?.avatar[0]?.path; //This req.files comes from the multer middleware function
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //This req.files comes from the multer middleware function

    let coverImageLocalPath;
    if (req.file && Array.isArray(req.file.coverImage) && req.file.coverImage.length > 0) {
        coverImageLocalPath = req.file.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file required multer");
    }

    //Uploading the images from local storage to on cloudinary server

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);



    if (!avatar) {
        throw new ApiError(400, "Avatar file is required cloudinary");
    }

    //pushing all the data entered by the user into the database

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //Removing the password and refreshToken fields form the user after it is being created
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    //Sending a response 
    res.status(201).json(
        new ApiResponse(
            201,
            isUserCreated,
            "User registered successfully"
        )
    );

});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, username, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "username or email is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "User doesn't exist");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loginUser = await User.findById(user._id).select("-password", "-refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedUser,accessToken,refreshToken
                },
                "user logged in successfully"
        )
    )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User loggedOut"))

})

export {
    registerUser,
    loginUser,
    logoutUser,
};