import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getVideoPlaylist,
  videoPlaylistCreate,
  videoUploadToPlaylist,
} from "../controllers/videoPlaylist.controller.js";

const router = Router();

router
  .route("/createdVideoPlaylist/:videoId")
  .post(verifyToken, videoPlaylistCreate);
router.route("/getPlaylist/:playListId").get(verifyToken, getVideoPlaylist);
router
  .route("/videoAddToList/:playListId/video/:videoId")
  .put(verifyToken, videoUploadToPlaylist);

export default router;
