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

const getWatchLaterVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  const videoId = req.params?.videoId;
  if (!userId || !videoId) throw new apiError(400, "user & video are required");

  const videos = WatchLater.aggregate([
    {
      $match: { owner: userId, videoId: videoId },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
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
  const result = await WatchLater.aggregatePaginate(videos, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "watchLater not found");

  return res
    .status(200)
    .json(new apiResponse(200, result, "watchLater fetched"));
});

export { createWatchLater, getWatchLaterVideos };
