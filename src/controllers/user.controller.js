import { User } from "../models/user.medel.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadImage from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //  get user details from frontend
  // validate user details
  // check if user already exist for email and username
  // check for images and avatar
  // upload theme to cloudinary
  // create user object --> create entry in db
  // remove password & refreshToken from response
  // check for user creation
  // return response

  const { username, email, password, fullName } = req.body;
  console.log("req.body : ", req.body);

  if (
    [username, email, password, fullName].some((field) => field.trim === "")
  ) {
    throw new apiError(400, "all fields are required");
  }

  const isUserAlreadyExist = await User.findOne({
    $or: [{ username, email }],
  });
  if (isUserAlreadyExist) {
    throw new apiError(409, "username or password already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length < 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(404, "avatar is required");
  }

  const uploadedAvatarRes = await uploadImage(avatarLocalPath);
  const uploadedCoverImageRes = await uploadImage(coverImageLocalPath);

  console.log("uploadedAvatarRes: ", uploadedAvatarRes);
  console.log("uploadedCoverImageRes: ", uploadedCoverImageRes);

  if (!uploadedAvatarRes) throw new apiError("internal server error");

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: {
      url: uploadedAvatarRes.url,
      public_id: uploadedAvatarRes.public_id,
    },
    coverImage: {
      url: uploadedCoverImageRes?.url || "",
      public_id: uploadedCoverImageRes?.public_id || "",
    },
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) throw new apiError(500, "server internal error");

  res.status(201).json(new apiResponse(201, userCreated));
});

export { registerUser };
