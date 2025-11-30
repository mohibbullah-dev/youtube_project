import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { VideoPlaylist } from "../models/vidoe_playlist.model.js";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

const videoPlaylistCreate = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const videoId = req.params?.videoId;
  const userId = req.user?.id;

  if (!name) throw new apiError(400, "name is required");

  if (!userId) throw new apiError(400, "vodeo and user are required");

  const videoList = await VideoPlaylist.create({
    name,
    description: description || "",
    videos: [],
    owner: userId,
  });
  if (!videoList) throw new apiError(500, "videoList creation faild");

  return res
    .status(201)
    .json(new apiResponse(200, videoList, "videoPlaysist created succefully"));
});
const getAllPlaylist = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const allPlaylists = VideoPlaylist.aggregate([
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
  const result = await VideoPlaylist.aggregatePaginate(allPlaylists, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "videoList not found");

  return res
    .status(200)
    .json(new apiResponse(200, result, "allPlaylist fetched"));
});

const videoUploadToPlaylist = asyncHandler(async (req, res) => {
  const { playListId, videoId } = req.params;
  if (!playListId || !videoId)
    throw new apiError(400, "playList and video are required");
  const video = await Video.findById(videoId);
  if (!video) throw new apiError(404, "video not found");

  const playlist = await VideoPlaylist.findByIdAndUpdate(
    playListId,
    { $addToSet: { videos: video._id } },
    { new: true }
  );
  if (!playlist) throw new apiError(404, "playlist not found");

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "video added to list succefully"));
});

const getVideoPlaylist = asyncHandler(async (req, res) => {
  const playListId = req.params?.playListId;
  if (!playListId) throw new apiError(404, "playList is required");
  const playList = await VideoPlaylist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playListId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: { username: 1, avatar: 1, _id: 0 },
                },
              ],
            },
          },
          {
            $addFields: { owner: { $first: "$owner" } },
          },
        ],
        pipeline: [
          {
            $project: { views: 0, createdAt: 0, updatedAt: 0 },
          },
        ],
      },
    },
  ]);
  console.log("playList : ", playList);

  if (!playList || playList.length === 0)
    throw new apiError(404, "video playlist not found");
  return res
    .status(200)
    .json(new apiResponse(200, playList, "playlist fetched"));
});

const deleteVideoPlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params?.playlistId;
  if (!playlistId) throw new apiError(400, "playlist is requried");

  const deletePlaylist = await VideoPlaylist.findByIdAndDelete(playlistId);
  if (!deletePlaylist) throw new apiError(404, "videoPlaylist not found");

  return res
    .status(204)
    .json(new apiResponse(204, deletePlaylist, "playlist deleted succefully"));
});

export {
  videoPlaylistCreate,
  getVideoPlaylist,
  videoUploadToPlaylist,
  deleteVideoPlaylist,
  getAllPlaylist,
};
