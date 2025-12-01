import mongoose from "mongoose";
import { WatchLater } from "../models/watchLater.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createWatchLater = asyncHandler(async (req, res) => {
  const videoId = req.params?.videoId;
  const userId = req.user?.id;

  if (!videoId || !userId) throw new apiError(400, "video & user are required");

  const exists = await WatchLater.findOne({ owner: userId, videoId: videoId });
  let watchLater;
  if (!exists) {
    watchLater = await WatchLater.create({
      owner: userId,
      videoId: videoId,
    });
  }

  return res
    .status(201)
    .json(new apiResponse(201, watchLater, "created watchLater"));
});

const getSingleWatchLaterVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const watchLaterId = req.params?.watchLaterId;
  if (!userId || !watchLaterId)
    throw new apiError(400, "user & video are required");

  const watchlater = await WatchLater.findOne({
    owner: userId,
    _id: watchLaterId,
  }).populate({
    path: "videoId",
    select: "title description video owner status views",
    populate: { path: "owner", select: "avatar username" },
  });
  if (!watchlater) throw new apiError(404, "watchLate not found");

  return res
    .status(200)
    .json(new apiResponse(200, watchlater, "watchLater fetched"));
});

const getAllMyWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is requried");
  const wathLaters = WatchLater.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
        foreignField: "owner",
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
                  $project: { avatar: 1, username: 1 },
                },
              ],
            },
          },
          {
            $addFields: { owner: { $first: "$owner" } },
          },
        ],
      },
    },
  ]);
  const result = await WatchLater.aggregatePaginate(wathLaters, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new (404, "wathcLate not found")();
  return res
    .status(200)
    .json(new apiResponse(200, result, "watchLater fetched"));
});

const deleteWatchLater = asyncHandler(async (req, res) => {
  const watchLaterId = req.params?.watchLaterId;
  if (!watchLaterId) throw new apiError(400, "watchLater is required");
  const deleteWatchLater = await WatchLater.findById(watchLaterId);
  if (!deleteWatchLater) throw new apiError(404, "watchlater not found");

  return res
    .status(204)
    .json(new apiResponse(202, deleteWatchLater, "watchLater deleted"));
});

export {
  createWatchLater,
  getSingleWatchLaterVideos,
  getAllMyWatchLater,
  deleteWatchLater,
};
