import mongoose from "mongoose";
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

  console.log("cloudinaryVideoResponse :", cloudinaryVideoResponse);

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
    videoDuration: cloudinaryVideoResponse?.duration,
    owner: req.user?.id,
  });
  if (!videoSavedToDb) throw new apiError(500, "failed to save to database");

  return res
    .status(201)
    .json(
      new apiResponse(200, videoSavedToDb, "video saved to db successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params?.videoId;
  if (!videoId) throw new apiError(400, "video is required");

  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) throw new apiError(404, "video not found");

  return res
    .status(204)
    .json(new apiResponse(204, deleteVideo, "video delete succefully"));
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
const getAllVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const videos = await Video.aggregate([
    {
      $match: {},
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);
  if (videos.length === 0) throw new apiError(404, "video not found");
  return res
    .status(200)
    .json(new apiResponse(200, videos, "fetched all videos"));
});

const getAllActiveVideos = asyncHandler(async (req, res) => {
  const activeVideos = await Video.aggregate([
    {
      $match: { status: "active" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { avatar: 1, username: 1 },
    },
  ]);
  if (activeVideos.length === 0)
    throw new apiError(404, "active videos not found");
  return res
    .status(200)
    .json(new apiResponse(200, activeVideos, "active videos fetched"));
});

const getAllPravateVideos = asyncHandler(async (req, res) => {
  const pirvateVideos = await Video.aggregate([
    {
      $match: { status: "private" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);
  if (pirvateVideos.length === 0)
    throw new apiError(404, "private videos not found");
  return res
    .status(200)
    .json(new apiResponse(200, pirvateVideos, "pirvateVideos videos fetched"));
});

const getAllPauseVideos = asyncHandler(async (req, res) => {
  const pauseVideos = await Video.aggregate([
    {
      $match: { status: "pause" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { avatar: 1, username: 1 },
    },
  ]);
  if (pauseVideos.length === 0)
    throw new apiError(404, "pauseVideos videos not found");
  return res
    .status(200)
    .json(new apiResponse(200, pauseVideos, "pauseVideos videos fetched"));
});

const getMyallvideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const myVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);
  if (myVideos.length === 0) throw new apiError(404, "vides not found");
  return res
    .status(200)
    .json(new apiResponse(200, myVideos, "my all videos fetched"));
});

const getMyActiveVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const myActiveVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), status: "active" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);

  if (myActiveVideos.length === 0) throw new apiError(404, "video not founed");
  return res.status(200).json(200, myActiveVideos, "active videos fetched");
});

const getMypravateVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const myPrivateVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), status: "private" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);

  if (myPrivateVideos.length === 0) throw new apiError(404, "video not founed");
  return res.status(200).json(200, myPrivateVideos, "private videos fetched");
});

const getMyPauseVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const myPauseVideos = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), status: "pause" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$owners" } },
    },
    {
      $project: { owners: 0 },
    },
  ]);

  if (myPauseVideos.length === 0) throw new apiError(404, "video not founed");
  return res.status(200).json(200, myPauseVideos, "puase videos fetched");
});

export {
  uploadYoutubeVideo,
  playVideo,
  deleteVideo,
  getAllVideos,
  getAllActiveVideos,
  getAllPravateVideos,
  getAllPauseVideos,
  getMyallvideos,
  getMyActiveVideos,
  getMypravateVideos,
  getMyPauseVideos,
};
