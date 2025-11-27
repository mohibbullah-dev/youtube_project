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

export { createVideoLike, createTweetLike, creatdCommentLike };
