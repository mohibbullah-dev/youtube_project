import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  deleteVideoPlaylist,
  getVideoPlaylist,
  videoPlaylistCreate,
  videoUploadToPlaylist,
} from "../controllers/videoPlaylist.controller.js";

const router = Router();

router.route("/createdVideoPlaylist").post(verifyToken, videoPlaylistCreate);
router.route("/getPlaylist/:playListId").get(verifyToken, getVideoPlaylist);
router
  .route("/videoAddToList/:playListId/video/:videoId")
  .put(verifyToken, videoUploadToPlaylist);
router
  .route("/deletePlaylist/:playlistId")
  .delete(verifyToken, deleteVideoPlaylist);

export default router;
