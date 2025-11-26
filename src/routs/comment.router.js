import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createTweetComment,
  createVideoComment,
} from "../controllers/coment.controller.js";

const router = Router();
router
  .route("/createVideoComment/:videoId")
  .post(verifyToken, createVideoComment);
router
  .route("/createTweetComment/:tweetId")
  .post(verifyToken, createTweetComment);

export default router;
