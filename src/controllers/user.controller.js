import { User } from "../models/user.medel.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadImage from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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

  if (
    [username, email, password, fullName].some((field) => field.trim() === "")
  ) {
    throw new apiError(400, "all fields are required");
  }

  const isUserAlreadyExist = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserAlreadyExist) {
    throw new apiError(409, "username or password already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
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

const loginUser = asyncHandler(async (req, res) => {
  console.log("hello i am form loginUser controller");
  // get user details
  // validate user deteials
  // find user to db useing email or password
  // validate the user response from db
  // validate password
  // generate accessToken & refreshToken
  //  send refreshToken to db
  // send accessToken & refreshToken to using cookies
  // finally response to user

  const email = (req?.body.email || "").trim().toLowerCase();
  const username = (req?.body.username || "").trim().toLowerCase();
  const password = (req?.body.password || "").trim().toLowerCase();

  if (!email && !username) {
    throw new apiError(400, "email or user is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) throw new apiError(404, "user not found");

  const isMatchPass = await user.isPasswordCorrect(password);
  if (!isMatchPass) throw new apiError(400, "invalid credentials");

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  console.log("hello i am now on the response stage");

  res
    .status(201)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        {
          accessToken: accessToken,
          refershToke: refreshToken,
        },
        "login successfully done"
      )
    );
});

const loguotUser = asyncHandler(async (req, res) => {
  // get userid from req.user you stored in verify function
  // validate the user's id
  // find the user using the id
  // validate the user
  // update the refreshToken by ""
  // then clear the cookies from browser too
  const { _id } = req.user;
  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  if (_id) {
    await User.findByIdAndUpdate(_id, { $set: { refreshToken: "" } });
  } else {
    throw new apiError(400, "invalid id");
  }

  res
    .status(204)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiResponse(200, "user succefully logout"));
});

const generateNewAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies?.refreshToken ||
    req.headers?.authorization?.replace("Bearer ", "");
  if (!incommingRefreshToken) throw new apiError(401, "unAuthorize request");
  let decodedRefreshToken;
  try {
    decodedRefreshToken = await jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedRefreshToken?.id)
      throw new apiError(400, "refreshToken not contain valid info");
    const user = await User.findById(decodedRefreshToken?.id);
    if (!user) throw new apiError(404, "user not found");

    if (user?.refreshToken !== incommingRefreshToken)
      throw new apiError(415, "invalid refreshToken");
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    const option = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res
      .status(201)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(new apiResponse(200, "accessToken renewed successfully"));
  } catch (error) {
    throw new apiError(401, error.message, "invalid token");
  }
});

export { loginUser, registerUser, loguotUser, generateNewAccessToken };
