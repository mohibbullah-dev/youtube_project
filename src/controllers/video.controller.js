import { User } from "../models/user.medel.js";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadImage, uploadVideo } from "../utils/cloudinary.js";

const uploadYoutubeVideo = asyncHandler(async (req, res) => {
  const videoLocalPath = req.files?.video[0]?.path;
  const videoThumbnaiLocalPath = req.files?.thumbnai[0]?.path;
  const { description } = req.body;
  if (!description || description.trim() === "")
    throw new apiError("400", "video description is required");
  console.log("videoLocalPath :", videoLocalPath);
  if (!videoLocalPath) throw new apiError(400, "video file is required");
  const cloudinaryVideoResponse = await uploadVideo(videoLocalPath);
  const cloudinaryVideoThumbnailResponse = await uploadImage(
    videoThumbnaiLocalPath
  );
  if (
    !cloudinaryVideoResponse ||
    !cloudinaryVideoResponse.public_id ||
    !cloudinaryVideoResponse.secure_url ||
    !cloudinaryVideoResponse.duration
  )
    throw new apiError(200, "cloudinary video upload filaid");

  if (!cloudinaryVideoThumbnailResponse)
    throw new apiError(500, "cloudinaryVideoThumbnailResponse is faild");

  const videoSavedToDb = await Video.create({
    title: req.files?.video[0]?.originalname,
    description,
    video: {
      url: cloudinaryVideoResponse?.secure_url,
      public_id: cloudinaryVideoResponse?.public_id,
    },
    videoThumbnail: {
      url: cloudinaryVideoThumbnailResponse.secure_url || "",
      public_id: cloudinaryVideoThumbnailResponse.public_id || "",
    },
    owner: req.user?.id,
  });
  if (!videoSavedToDb) throw new apiError(500, "failed to save to database");

  return res
    .status(201)
    .json(
      new apiResponse(200, videoSavedToDb, "video saved to db successfully")
    );
});

const playVideo = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const videoId = req.params?.videoId;
  if (!videoId && !userId)
    throw new Error(404, "video and userId are required");

  const video = await Video.findById(videoId);
  if (!video) throw new Error(404, "video not found");

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { watchHistory: video._id } },
    { new: true }
  );
  if (!user) throw new Error(404, "user not found");

  return res
    .status(200)
    .json(new apiResponse(200, { video, user }, "video played succfully"));
});

export { uploadYoutubeVideo, playVideo };
