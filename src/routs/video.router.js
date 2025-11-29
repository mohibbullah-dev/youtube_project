import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getAllActiveVideos,
  getAllPauseVideos,
  getAllPravateVideos,
  getAllVideos,
  getMyActiveVideos,
  getMyallvideos,
  getMyPauseVideos,
  getMypravateVideos,
  playVideo,
  uploadYoutubeVideo,
} from "../controllers/video.controller.js";
const router = Router();

router.route("/upload-video").post(
  verifyToken,
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnai", maxCount: 1 },
  ]),
  uploadYoutubeVideo
);

router.route("/palyVideo/:videoId").get(verifyToken, playVideo);
router.route("/deleteVideo/:videoId").delete(verifyToken, deleteVideo);
router.route("/getAllVideos").get(verifyToken, getAllVideos);
router.route("/activeVideos").get(verifyToken, getAllActiveVideos);
router.route("/privateVideos").get(verifyToken, getAllPravateVideos);
router.route("/pauseVideos").get(verifyToken, getAllPauseVideos);
router.route("/myAllVideos").get(verifyToken, getMyallvideos);
router.route("/myActiveVideos").get(verifyToken, getMyActiveVideos);
router.route("/myPrivateVideos").get(verifyToken, getMypravateVideos);
router.route("/myPauseVideos").get(verifyToken, getMyPauseVideos);

export default router;
