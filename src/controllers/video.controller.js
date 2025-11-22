import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadVideo } from "../utils/cloudinary.js";

const uploadYoutubeVideo = asyncHandler(async (req, res) => {
  const videoLocalPath = req.file?.path;
  console.log("videoLocalPath :", videoLocalPath);
  if (!videoLocalPath) throw new apiError(400, "video file is required");
  const CloudinaryResponse = await uploadVideo(videoLocalPath);
  console.log("video CloudinaryResponse :", CloudinaryResponse);

  return res
    .status(200)
    .json(
      new apiResponse(200, CloudinaryResponse, "video upload succeefully done")
    );
});

export { uploadYoutubeVideo };
