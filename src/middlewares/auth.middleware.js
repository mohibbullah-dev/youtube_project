import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.medel.js";

const verifyToken = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new apiError(401, "user not logedIn");

  let decodedToken;

  try {
    decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new apiError(401, "not valid token", error);
  }
  if (!decodedToken?.id)
    throw new apiError(400, "token not contain valid user's info");

  const user = await User.findById(decodedToken.id).select(
    "-password -refreshToken -createdAt -updatedAt"
  );
  if (!user) throw new apiError("404", "user no longer exists");

  req.user = user;
  next();
});

export { verifyToken };
