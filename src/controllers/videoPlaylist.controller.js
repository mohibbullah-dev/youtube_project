import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { VideoPlaylist } from "../models/vidoe_playlist.model.js";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const videoPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const videoId = req.params?.videoId;
  const userId = req.user?.id;

  if (!name) throw new apiError(400, "name is required");

  if (!videoId && !userId)
    throw new apiError(400, "vodeo and user are required");

  const video = await Video.findById(videoId);
  if (!video) throw new apiError(404, "video not found");

  const videoList = await VideoPlaylist.create({
    name,
    description: description || "",
    videos: [video._id],
    owner: userId,
  });
  if (!videoList) throw new apiError(500, "videoList creation faild");

  return res
    .status(201)
    .json(new apiResponse(200, videoList, "videoPlaysist created succefully"));
});

export { videoPlaylist };
