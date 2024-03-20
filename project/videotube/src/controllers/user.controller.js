import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {

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

    //Now getting the local path of the images uploaded by the user
    const avatarLocalPath = req.files?.avatar[0]?.path; //This req.files comes from the multer middleware function
    const coverImageLocalPath = req.files?.coverImage[0]?.path;//This req.files comes from the multer middleware function

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

export { registerUser };