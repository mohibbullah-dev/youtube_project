import { v2 as cloudinary } from "cloudinary";
import fs, { existsSync } from "fs";
import { apiError } from "../utils/apiError.js";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIkEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

// image start
const uploadImage = async (localImagePath) => {
  const Image_upload_options = {
    resource_type: "image",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    if (!localImagePath) return null;
    const result = await cloudinary.uploader.upload(
      localImagePath,
      Image_upload_options
    );
    console.log("cloudinary result: ", result);
    if (fs.existsSync(localImagePath)) fs.unlinkSync(localImagePath);

    return result;
  } catch (error) {
    console.error(error);
    if (fs.existsSync(localImagePath)) fs.unlinkSync(localImagePath);

    return null;
  }
};

const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id, { invalidate: true });
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong when deleting file in cloudinary",
      error.message
    );
  }
};

// image ends

// video start

const uploadVideo = async (localVideoPath) => {
  const video_upload_options = {
    resource_type: "video",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    const result = await cloudinary.uploader.upload(
      localVideoPath,
      video_upload_options
    );
    console.log("video_result :", result);
    if (fs.existsSync(localVideoPath)) fs.unlinkSync(localVideoPath);
    return result;
  } catch (error) {
    if (fs.existsSync(localVideoPath)) fs.unlinkSync(localVideoPath);
    throw new apiError(
      500,
      "something went wrong while uploading video",
      error.message
    );
  }
};

const deleteVideo = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while deleting video",
      error.message
    );
  }
};

export { uploadImage, deleteImage, uploadVideo, deleteVideo };
