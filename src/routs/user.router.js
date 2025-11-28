import { Router } from "express";
import {
  changeCoverImage,
  changePassword,
  changeProfile,
  forgetPassword,
  generateNewAccessToken,
  getChannelProfile,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  loguotUser,
  registerUser,
  resetPasswrod,
  updateUserDetails,
  verifyEmail,
  verifyOtp,
} from "../controllers/user.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  uploadImage.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/verifyEmail").get(verifyEmail);

router.route("/login").post(loginUser);
router.route("/logout").delete(verifyToken, loguotUser);
router.route("/renewAccessToken").get(generateNewAccessToken);
router.route("/changePassword").put(verifyToken, changePassword);
router.route("/userDetailsUpdate").put(verifyToken, updateUserDetails);
router.route("/me").get(verifyToken, getCurrentUser);
router
  .route("/changeAvatar")
  .put(verifyToken, uploadImage.single("avatar"), changeProfile);
router
  .route("/changeCoverImage")
  .put(verifyToken, uploadImage.single("converImage"), changeCoverImage);

router.route("/getChnnelInfo/:username").get(verifyToken, getChannelProfile);

router.route("/watchHistory").get(verifyToken, getWatchHistory);
router.route("/forgetPass").post(verifyToken, forgetPassword);
router.route("/verifyOtp").post(verifyToken, verifyOtp);
router.route("/resetPass").post(verifyToken, resetPasswrod);

export default router;
