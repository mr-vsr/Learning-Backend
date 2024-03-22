import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);

        //unlinking the files after successfully uploading it
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFromCloduinary = async (publicId, resourceType) => {
    try {        
        await cloudinary.uploader.destroy(
            publicId,
            { type: 'upload', resource_type:resourceType})
    } catch (error) {
        throw new ApiError(500, error.message || "Error occurred while deleting the resource from the server");
    }
}



export {
    uploadOnCloudinary,
    deleteFromCloduinary
}