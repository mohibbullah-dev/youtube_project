import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  creatdCommentLike,
  createTweetLike,
  createVideoLike,
} from "../controllers/like.controller.js";

const router = Router();
router.route("/createVideoLike/:videoId").post(verifyToken, createVideoLike);
router.route("/createTweetLike/:tweetId").post(verifyToken, createTweetLike);
router
  .route("/createCommentLike/:commentId")
  .post(verifyToken, creatdCommentLike);

export default router;
