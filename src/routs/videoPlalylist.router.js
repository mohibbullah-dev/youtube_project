import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { videoPlaylist } from "../controllers/videoPlaylist.controller.js";

const router = Router();

router.route("/createdVideoPlaylist/:videoId").post(verifyToken, videoPlaylist);

export default router;
