import { Router } from "express";
import {
  changeCoverImage,
  changePassword,
  changeProfile,
  generateNewAccessToken,
  getChannelProfile,
  getCurrentUser,
  loginUser,
  loguotUser,
  registerUser,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").delete(verifyToken, loguotUser);
router.route("/renewAccessToken").get(generateNewAccessToken);
router.route("/changePassword").put(verifyToken, changePassword);
router.route("/userDetailsUpdate").put(verifyToken, updateUserDetails);
router.route("/me").get(verifyToken, getCurrentUser);
router
  .route("/changeAvatar")
  .put(verifyToken, upload.single("avatar"), changeProfile);
router
  .route("/changeCoverImage")
  .put(verifyToken, upload.single("converImage"), changeCoverImage);

router.route("/getChnnelInfo/:username").get(verifyToken, getChannelProfile);
export default router;
