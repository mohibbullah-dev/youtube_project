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

  const { username, email, password, full_name } = req.body;
  if (
    [username, email, password, full_name].some((field) => field.trim === "")
  ) {
    throw new apiError(400, "all fields are required");
  }

  const isUserAlreadyExist = await User.findOne({
    $or: [{ username, email }],
  });
  if (isUserAlreadyExist) {
    throw new apiError(409, "username or password already exist");
  }

  const avatar = req.files?.avatar[0]?.path;
  const coverImage = req.files?.coverImage[0]?.path;

  if (!avatar) {
    throw new apiError(404, "avatar is required");
  }

  const uploadedAvatarRes = await uploadImage(avatar);
  const uploadedCoverImageRes = await uploadImage(coverImage);
  console.log("uploadedAvatarRes", uploadedAvatarRes);
  console.log("uploadedCoverImageRes", uploadedCoverImageRes);

  if (!uploadedAvatarRes) throw new apiError("internal server error");
  res.status(200).json({ message: "This is first route for testing purpose" });
});
const user = await User.create({
  username,
  email,
  password,
  full_name,
  avatar: {
    url: uploadedAvatarRes.url,
    public_id: uploadedAvatarRes.public_id,
  },
  coverImage: {
    url: uploadedCoverImageRes.url,
    public_id: uploadedCoverImageRes.public_id,
  },
});

const userCreated = await User.findById(user._id).select(
  "-password -refreshToken"
);
if (!userCreated) throw new apiError(500, "server internal error");

res.status(201).json(new apiResponse(201, userCreated));

export { registerUser };
