import { Tweet } from "../models/tweet.model.js";
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

export { createTweet };
