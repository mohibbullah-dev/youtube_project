import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.medel.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadImage } from "../utils/cloudinary.js";

const createTweet = asyncHandler(async (req, res) => {
  const { title, description = "" } = req.body;
  const localPath = req.file?.path;
  const userId = req.user?.id;
  if (!userId && !title && !localPath)
    throw new apiError(400, "title, userId and file are required");
  const response = await uploadImage(localPath);
  if (!response) throw new apiError(500, "image upload to cloudinary faild");

  if (response.secure_url) {
    const tweet = await Tweet.create({
      title,
      description,
      image: {
        url: response.secure_url,
        public_id: response.public_id,
      },
      owner: userId,
    });
    if (!tweet)
      throw new apiError(500, "something went wrong while tweet creation");

    return res
      .status(201)
      .json(new apiResponse(200, tweet, "tweet created successfully"));
  }
});

const updateTweets = asyncHandler(async (req, res) => {
  const tweetId = req.params?.id;
  const { title, description, status } = req.body;
  const postImage = req.file?.path;
  if (!tweetId && !postImage)
    throw new apiError(400, "tweet && postImage is required");

  if (!title) throw new apiError(400, "title is reqruired");

  const cloudinaryResponse = await uploadImage(postImage);
  if (!cloudinaryResponse) throw new (500, "cloudinary image upload faild")();

  const updatePost = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      title,
      description,
      status,
      image: {
        url: cloudinaryResponse?.secure_url,
        public_id: cloudinaryResponse?.public_id,
      },
    },
    { new: true }
  );
  if (!updatePost) throw new apiError(404, "tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, updatePost, "tweet updated succefully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const Tweets = Tweet.aggregate([
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
  const result = await Tweet.aggregatePaginate(Tweets, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "fetched all tweets"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params?.tweetId;
  if (!tweetId) throw new apiError(400, "tweet is required");

  const deleteTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deleteTweet) throw new apiError(404, "tweet not found");

  return res
    .status(204)
    .json(new apiResponse(204, deleteTweet, "tweet delete succefully"));
});

const getAllActiveTweet = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const activeTweet = Tweet.aggregate([
    {
      $match: { status: "active" },
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

  const result = await Tweet.aggregatePaginate(activeTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "active tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "active tweet fetched"));
});

const getAllPrivateTweet = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const privateTweet = Tweet.aggregate([
    {
      $match: { status: "private" },
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
  const result = await Tweet.aggregatePaginate(privateTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "private tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "private tweet fetched"));
});

const getAllDeactiveTweet = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const deactiveTweet = Tweet.aggregate([
    {
      $match: { status: "deActive" },
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

  const result = await Tweet.aggregatePaginate(deactiveTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "deactive tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "deactive tweet fetched"));
});

const getMyalltweets = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;

  if (!userId) throw new apiError(400, "user is required");
  const myTweets = Tweet.aggregate([
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
  const result = await Tweet.aggregatePaginate(myTweets, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweet not found");
  return res
    .status(200)
    .json(new apiResponse(200, result, "my all tweets fetched"));
});

const getMyActiveTweets = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");
  const myActiveTweet = Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), status: "active" },
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

  const result = await Tweet.aggregatePaginate(myActiveTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweet not founed");
  return res.status(200).json(200, result, "active tweet fetched");
});

const getMyPrivateTweets = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const userId = req.user?.id;
  if (!userId) throw new apiError(400, "user is required");
  const myPrivateTweet = Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId), status: "private" },
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

  const result = await Tweet.aggregatePaginate(myPrivateTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweet not founed");
  return res.status(200).json(200, result, "private tweet fetched");
});

const getMyDeactiveTweets = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) throw new apiError(400, "user is required");

  const myDeactiveTweet = Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
        status: "deActive",
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

  const result = await Tweet.aggregatePaginate(myDeactiveTweet, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });

  if (!result || result.docs.length === 0)
    throw new apiError(404, "tweet not founed");
  return res.status(200).json(200, result, "deactive tweet fetched");
});

export {
  createTweet,
  getAllTweets,
  deleteTweet,
  getAllActiveTweet,
  getAllPrivateTweet,
  getAllDeactiveTweet,
  getMyalltweets,
  getMyActiveTweets,
  getMyPrivateTweets,
  getMyDeactiveTweets,
  updateTweets,
};
