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

const deleteVidoeComment = asyncHandler(async (req, res) => {
  const videoCommentId = req.params.videoCommentId;
  if (!videoCommentId) throw new apiError(400, "videoComment is required");

  await Comment.findByIdAndDelete(videoCommentId);
  return res
    .status(204)
    .json(new apiResponse(204, "deleted comment succefully"));
});

const UpdateVidoeComment = asyncHandler(async (req, res) => {
  const videoCommentId = req.params.videoCommentId;
  const { content } = req.body;

  if (!videoCommentId) throw new apiError(400, "videoComment is required");
  const updateComment = await Comment.findByIdAndUpdate(
    videoCommentId,
    { content },
    { new: true }
  );
  if (!updateComment)
    throw new apiError(404, updateComment, "comment not found");

  await Comment.findByIdAndDelete(videoCommentId);
  return res
    .status(204)
    .json(new apiResponse(204, "deleted comment succefully"));
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
  deleteVidoeComment,
  UpdateVidoeComment,
  getVideoComments,
};
