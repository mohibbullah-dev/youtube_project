import mongoose from "mongoose";
import { User } from "../models/user.medel.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadImage } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendEmail, verifyMailFormat, verifyOtpFormat } from "../utils/mail.js";

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
  console.log("avatarLocalPath :", req.files?.avatar[0]);
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
  console.log("uploadedAvatarRes :", uploadedAvatarRes);
  const uploadedCoverImageRes = await uploadImage(coverImageLocalPath);

  console.log("uploadedAvatarRes: ", uploadedAvatarRes);
  console.log("uploadedCoverImageRes: ", uploadedCoverImageRes);

  if (
    !uploadedAvatarRes ||
    !uploadedAvatarRes.public_id ||
    !uploadedAvatarRes.secure_url
  )
    throw new apiError(500, "internal server error");

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
  if (!user) throw new apiError(500, "user creation failed");

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) throw new apiError(404, "user not found");

  const token = await userCreated.jwtToken();
  if (token) {
    const verifyUrl = `${process.env.APP_URL}/api/v1/users/verify/?token=${token}`;
    sendEmail({
      email,
      subject: "verify your email",
      mailformat: verifyMailFormat(fullName, verifyUrl),
    });
  }

  return res.status(201).json(new apiResponse(201, userCreated));
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

  return res
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

  return res
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
    return res
      .status(201)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(new apiResponse(200, "accessToken renewed successfully"));
  } catch (error) {
    throw new apiError(401, error.message, "invalid token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  // get user's details
  // validate user's details
  // find the user to DB by req.user.id
  // verify old password
  // match confirm & password
  //  save the new password to db
  // then finally you send a response to frontend
  // write a route with a middle called 'verifyToken'

  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!(oldPassword && newPassword & confirmPassword))
    throw new apiError(400, "oldPassword required");
  const user = await User.findById(req.user?.id);
  console.log("user : ", user);
  if (!user) throw new apiError(404, "user not found");
  const isMatched = await user.isPasswordCorrect(oldPassword);
  if (!isMatched) throw new apiError(401, "invalid oldPassword");
  if (!(newPassword === confirmPassword))
    throw new apiError(401, "wrong confirmPassword");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, "password changed successfully"));
});

const forgetPassword = asyncHandler(async (req, res) => {
  // get the email form user
  // verify it if empty or not
  // make a random otp
  const { email } = req.body;
  if (!email) throw new apiError(400, "email is required");
  const user = await User.findOne({ email });
  if (!user) throw new apiError(404, "user not found");

  const otp = Math.floor(100000 + Math.random() * 900000);
  if (!otp) throw new apiError(400, "otp generation faild");

  sendEmail({
    email,
    subject: "reset your password",
    mailformat: verifyOtpFormat(user.fullName, otp),
  });

  user.resetPassOtp = otp;
  user.resetPassOtpExpiredIn = Date.now() + 5 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, "otp sent"));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findOne({ resetPassOtp: otp });
  if (user.resetPassOtpExpiredIn < Date.now()) {
    user.resetPassOtp = null;
    user.resetPassOtpExpiredIn = null;
    await user.save({ validateBeforeSave: false });
    throw new apiError(400, "invalid otp");
  }
  if (!user) {
    throw new apiError(400, "invalid otp");
  }
  return res.status(200).json(new apiResponse(200, "otp verified"));
});

const resetPasswrod = asyncHandler(async (req, res) => {
  const { otp, password } = req.body;
  if (!otp || !password)
    throw new apiError(400, "otp and password is required");
  const user = await User.findOne({ resetPassOtp: otp });
  if (!user) throw new apiError(404, "invalid otp");

  if (user.resetPassOtpExpiredIn < Date.now()) {
    user.resetPassOtp = null;
    user.resetPassOtpExpiredIn = null;
    throw new apiError(400, "invalid otp");
  }
  user.password = password;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, "resetPasswore succefully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  // get user details from req.body
  // validate them empty or filled
  //  create a empty obeject called updateUser
  // keep the user details to the empty object
  // check username & email already exists if it is the thro error 'user already exists'
  // then update the user details to db using update query
  // finally return a res as a successful

  const { username, email, fullName } = req?.body;
  const updateUser = {};
  if (username) updateUser.username = username.toLowerCase().trim();
  if (email) updateUser.email = email.toLowerCase().trim();
  if (fullName) updateUser.fullName = email.trim();

  if (username || email) {
    const usernameOremailExist = await User.findOne({
      $or: [username ? { username } : null, email ? { email } : null].filter(
        Boolean
      ),
      _id: { $ne: req.user.id },
    });

    if (usernameOremailExist)
      throw new apiError(401, "username or email already exist");
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, updateUser, {
    new: true,
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedUser, "user's details updated succefully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id).select(
    "-password -refreshToken"
  );
  if (!currentUser) throw new apiError(404, "user current user not found");
  return res
    .status(200)
    .json(new apiResponse(200, currentUser, "cuurent user succefully fetched"));
});

const changeProfile = asyncHandler(async (req, res) => {
  // get user profile using req.file
  // validate it
  // send it to cloudinary
  // check cloudinary response empty or filled
  // find the user wiht req.user.id
  // update the db profile url with new one and public_id
  //  save the user
  // finally return a response
  console.log(" req.file :", req.file);
  const avatar = req.file?.path;

  const updateProfile = {};
  if (!avatar) throw new apiError(401, " avatar is required");

  const response = await uploadImage(avatar);
  if (!response) throw new apiError(500, "Cloudinary image upload failed");

  if (response?.url) {
    updateProfile["avatar.url"] = response.url;
  }
  if (response?.public_id) {
    updateProfile["avatar.public_id"] = response.public_id;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateProfile },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new apiError(404, "file cloudn't found");

  return res
    .status(200)
    .json(new apiResponse(200, user, "profile updated successfully"));
});

const changeCoverImage = asyncHandler(async (req, res) => {
  // same like avatar
  const converImage = req.file?.path;
  const updateConverImage = {};
  if (!converImage) throw new apiError(400, "select a coverImage");
  const response = await uploadImage(converImage);
  if (!response) throw new apiError(500, "Cloudinary image upload failed");

  if (response?.url) {
    updateConverImage["coverImage.url"] = response?.url;
  }
  if (response?.public_id) {
    updateConverImage["coverImage.public_id"] = response?.public_id;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateConverImage },
    { new: true }
  ).select("-password -refreshToken");
  if (!user) throw new apiError(200, "user cloudn't updated");

  return res
    .status(200)
    .json(new apiResponse(200, user, "coverImage succfully done"));
});

const getChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const currentUserId = new mongoose.Types.ObjectId(req.user.id);
  if (!username?.trim()) throw new apiError(400, "username is required");

  const channelInfo = await User.aggregate([
    {
      $match: { username: username?.trim() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },
        IsSubscribed: {
          $cond: {
            if: { $in: [currentUserId, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        IsSubscribed: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (channelInfo.length === 0)
    throw new apiError(404, "channelInfo not found");

  return res
    .status(200)
    .json(new apiResponse(200, channelInfo, "chennel profile fetched"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  // lookup to Video-collection
  // a sub-pipeline into lookup
  // lookup to user to find video owner
  // write a $project pipeline into video owner lookup
  // write a $addFields pipeline to overried owner with first value of array
  // finally extract the obejct from main pipeline array because pipeline always reture a array & return respons

  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user.id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwner",
              pipeline: [
                {
                  $project: { fullName: 1, username: 1, avatar: 1 },
                },
              ],
            },
          },
          {
            $project: { owner: 0 },
          },
        ],
      },
    },
    {
      $project: { username: 1, watchHistory: 1, avatar: 1 },
    },
  ]);

  if (!user) throw new Error(400, "user not found");

  console.log("user: ", user);

  return res
    .status(200)
    .json(new apiResponse(200, user, "fetched watchHistory succefully"));
});

export {
  loginUser,
  registerUser,
  loguotUser,
  generateNewAccessToken,
  changePassword,
  updateUserDetails,
  getCurrentUser,
  changeProfile,
  changeCoverImage,
  getChannelProfile,
  getWatchHistory,
  forgetPassword,
  verifyOtp,
  resetPasswrod,
};
