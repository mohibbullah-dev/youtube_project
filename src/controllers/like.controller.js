import mongoose from "mongoose";
import { LiKe } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createVideoLike = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const videoId = req.params?.videoId;
  if (!userId && !videoId)
    throw new apiError(400, "user and video are required");
  const like = await LiKe.create({
    owner: userId,
    likeOn: videoId,
    modelOn: "Video",
  });
  if (!like) throw new apiError(500, "videoLike creation is failed");
  return res
    .status(201)
    .json(new apiResponse(200, like, "like created succefully"));
});
const MyvideoLikes = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const videoLikes = LiKe.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), modelOn: "Video" },
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

  const result = await LiKe.aggregatePaginate(videoLikes, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "videlLike not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "videoLike are fetched"));
});

const createTweetLike = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const tweetId = req.params?.tweetId;
  if (!userId && !tweetId)
    throw new apiError(400, "user and tweet are required");

  const like = await LiKe.create({
    owner: userId,
    likeOn: tweetId,
    modelOn: "Tweet",
  });

  if (!like) throw new apiError(500, "tweetLike creation is failed");
  return res
    .status(201)
    .json(new apiResponse(200, like, "tweetLike created succefully"));
});

const MyTweetLikes = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");
  const tweetLikes = LiKe.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), modelOn: "Tweet" },
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
  const result = await LiKe.aggregatePaginate(tweetLikes, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweetLikes not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "tweetLikes are fetched"));
});

const creatdCommentLike = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const commentId = req.params?.commentId;
  if (!userId && !commentId)
    throw new apiError(400, "user and comment are required");

  const like = await LiKe.create({
    owner: userId,
    likeOn: commentId,
    modelOn: "Comment",
  });

  if (!like) throw new apiError(500, "commentLike creation is failed");
  return res
    .status(201)
    .json(new apiResponse(200, like, "commentLike created succefully"));
});
const MyCommentLikes = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");

  const commentLikes = LiKe.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        modelOn: "Comment",
      },
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

  const result = await LiKe.aggregatePaginate(commentLikes, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "commentLikes not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "commentLikes are fetched"));
});

const getAllLikes = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;

  if (!userId) throw new apiError(400, "user is required");
  const likes = LiKe.aggregate([
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
  const result = await LiKe.aggregatePaginate(likes, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "likes not found");

  return res
    .status(200)
    .json(new apiResponse(200, result, "all likes fetched"));
});

const deleteLike = asyncHandler(async (req, res) => {
  const likeId = req.params?.likeId;
  if (!likeId) throw new apiError(400, "likeId not found");

  await LiKe.findByIdAndDelete(likeId);
  return res
    .status(204)
    .json(new apiResponse(204, "liked deleted succefullay"));
});

export {
  createVideoLike,
  createTweetLike,
  creatdCommentLike,
  deleteLike,
  getAllLikes,
  MyvideoLikes,
  MyTweetLikes,
  MyCommentLikes,
};
