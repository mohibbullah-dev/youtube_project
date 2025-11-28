import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createTweetComment,
  createVideoComment,
  getVideoComments,
} from "../controllers/coment.controller.js";

const router = Router();
router
  .route("/createVideoComment/:videoId")
  .post(verifyToken, createVideoComment);
router
  .route("/createTweetComment/:tweetId")
  .post(verifyToken, createTweetComment);

router.route("/getAllComments").get(verifyToken, getVideoComments);

export default router;
