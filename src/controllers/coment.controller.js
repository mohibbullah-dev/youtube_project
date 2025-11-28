import mongoose from "mongoose";
import { Comment } from "../models/comment.mode.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createVideoComment = asyncHandler(async (req, res) => {
  // take the videos from  req.body
  // take the current user from req.user.id
  // check them empty or not
  // create comment to db
  //  finally retunr response to client

  const userId = req.user?.id;
  const videoId = req.params?.videoId;
  const { content } = req.body;

  if (!userId && !message && !videoId)
    throw new apiError(400, "user, content and video are required");
  const comment = await Comment.create({
    content: content,
    owner: userId,
    commentOn: videoId,
    onModel: "Video",
  });

  if (!comment)
    throw new apiError(500, "something went wrong while creating comment");

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
  const VideoComments = await Comment.aggregate([
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
  if (VideoComments.length === 0)
    throw new apiError(404, "videoComment not found");

  return res
    .status(200)
    .json(
      new apiResponse(200, VideoComments, "videoComments succfully fetched")
    );
});

const MyVideoComments = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const VideoComment = await Comment.aggregate([
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
  if (VideoComment.length === 0) throw new apiError(404, "comments not found");
  return res
    .status(200)
    .json(new apiResponse(200, VideoComment, "fetched myVideoComments"));
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
};
