import { Router } from "express";
import {
  createWatchLater,
  getSingleWatchLaterVideos,
} from "../controllers/watchLater.contorller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createWatchLater").post(verifyToken, createWatchLater);
router
  .route("/getSingleLaterWatchLater/:videoId")
  .get(verifyToken, getSingleWatchLaterVideos);

export default router;
