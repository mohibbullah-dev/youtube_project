import { Router } from "express";
import {
  createWatchLater,
  deleteWatchLater,
  getAllMyWatchLater,
  getSingleWatchLaterVideos,
} from "../controllers/watchLater.contorller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createWatchLater/:videoId").post(verifyToken, createWatchLater);
router
  .route("/getSingleLaterWatchLater/:videoId")
  .get(verifyToken, getSingleWatchLaterVideos);
router.route("/getAllMyWatchLater").get(verifyToken, getAllMyWatchLater);
router
  .route("/deleteWatchLater/:watchLaterId")
  .delete(verifyToken, deleteWatchLater);

export default router;
