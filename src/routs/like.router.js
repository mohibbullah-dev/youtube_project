import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  creatdCommentLike,
  createTweetLike,
  createVideoLike,
  deleteLike,
  getAllLikes,
  MyCommentLikes,
  MyTweetLikes,
  MyvideoLikes,
} from "../controllers/like.controller.js";

const router = Router();
router.route("/createVideoLike/:videoId").post(verifyToken, createVideoLike);
router.route("/createTweetLike/:tweetId").post(verifyToken, createTweetLike);
router
  .route("/createCommentLike/:commentId")
  .post(verifyToken, creatdCommentLike);
router.route("/deleteLike/:likeId").delete(verifyToken, deleteLike);
router.route("/allLikes").get(verifyToken, getAllLikes);
router.route("/myVideoLikes").get(verifyToken, MyvideoLikes);
router.route("/myTweetLikes").get(verifyToken, MyTweetLikes);
router.route("/myCommentLikes").get(verifyToken, MyCommentLikes);

export default router;
