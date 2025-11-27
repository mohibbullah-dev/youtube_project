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

export { createVideoComment, createTweetComment };
