import mongoose from "mongoose";
import { Comment } from "../models/comment.mode.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import { Video } from "../models/video.model.js";

const createVideoComment = asyncHandler(async (req, res) => {
  // take the videos from  req.body
  // take the current user from req.user.id
  // check them empty or not
  // create comment to db
  //  finally retunr response to client

  const userId = req.user?.id;
  const videoId = req.params?.videoId;
  const { content } = req.body;

  if (!userId || !content || !videoId)
    throw new apiError(400, "user, content and video are required");

  const video = await Video.findById(videoId);
  if (!video) throw new apiError(404, "video not found");

  const comment = await Comment.create({
    content: content,
    owner: userId,
    commentOn: videoId,
    onModel: "Video",
  });

  if (!comment)
    throw new apiError(500, "something went wrong while creating comment");

  // send notificatin to video owner
  await Notification.create({
    actor: userId,
    receiver: video.owner,
    type: "NEW_COMMENT",
    entityId: comment._id,
    message: "someone comment on your video",
  });

  return res
    .status(201)
    .json(new apiResponse(200, comment, "comment created successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const CommentId = req.params.CommentId;
  if (!CommentId) throw new apiError(400, "clientomment is required");

  await Comment.findByIdAndDelete(CommentId);
  return res
    .status(204)
    .json(new apiResponse(204, "deleted comment succefully"));
});

const commentUpdate = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const CommentId = req.params.CommentId;
  if (!CommentId && !content)
    throw new apiError(400, "comment & content are required");
  const updateComment = await Comment.findByIdAndUpdate(
    CommentId,
    { content },
    { new: true }
  );
  if (!updateComment) throw new apiError(404, "videoComment not found");
  return res
    .status(200)
    .json(new apiResponse(200, updateComment, "comment updated succefully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const VideoComments = Comment.aggregate([
    {
      $match: { onModel: "Video" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
            },
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

  const result = await Comment.aggregatePaginate(VideoComments, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "videoComment not found");

  return res
    .status(200)
    .json(new apiResponse(200, result, "videoComments succfully fetched"));
});

const MyVideoComments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");
  const VideoComment = Comment.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), onModel: "Video" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "users",
        pipeline: [
          {
            $project: { avatar: 1, username: 1 },
          },
        ],
      },
    },
    {
      $addFields: { owner: { $first: "$users" } },
    },
    {
      $project: { users: 0 },
    },
  ]);
  const result = await Comment.aggregatePaginate(VideoComment, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "comments not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "fetched myVideoComments"));
});

const getTweetsComment = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const tweetComments = Comment.aggregate([
    {
      $match: {},
    },
  ]);

  const result = await Comment.aggregatePaginate(tweetComments, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweetComment not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "tweetComment are fetched"));
});

const MyTweetComments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");
  const tweetVideos = Comment.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), onModel: "Tweet" },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owners",
        pipeline: [
          {
            $project: {
              avatar: 1,
              username: 1,
            },
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
  const result = await Comment.aggregatePaginate(tweetVideos, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
  });

  if (!result || result.result.length === 0)
    throw new apiError(404, "tweetVideos not found");

  return res
    .status(200)
    .json(new apiResponse(200, result, "myTweetVideo fetched sucefully"));
});

const createTweetComment = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const tweetId = req.params?.tweetId;
  const { content } = req.body;
  if (!userId && !tweetId && !content)
    throw new apiError(400, "userId, tweetId and content are required");

  const comment = await Comment.create({
    content: content,
    commentOn: tweetId,
    onModel: "Tweet",
    owner: userId,
  });

  if (!comment)
    throw new apiError(500, "something went wrong while comment creation");
  return res
    .status(201)
    .json(new apiResponse(200, comment, "comment created successfully"));
});

export {
  createVideoComment,
  createTweetComment,
  deleteComment,
  getVideoComments,
  commentUpdate,
  MyVideoComments,
  MyTweetComments,
  getTweetsComment,
};
