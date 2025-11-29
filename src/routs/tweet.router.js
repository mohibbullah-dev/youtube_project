import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getAllActiveTweet,
  getAllDeactiveTweet,
  getAllPrivateTweet,
  getAllTweets,
  getMyActiveTweets,
  getMyalltweets,
  getMyDeactiveTweets,
  getMyPrivateTweets,
} from "../controllers/tweet.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();
router
  .route("/createTweet")
  .post(verifyToken, uploadImage.single("image"), createTweet);

router.route("/getAllTweets").get(verifyToken, getAllTweets);
router.route("/deleteTweet").get(verifyToken, deleteTweet);
router.route("/getAllActiveTweet").get(verifyToken, getAllActiveTweet);
router.route("/getAllPrivateTweet").get(verifyToken, getAllPrivateTweet);
router.route("/getAllDeactiveTweet").get(verifyToken, getAllDeactiveTweet);
router.route("/getAllMyTweets").get(verifyToken, getMyalltweets);
router.route("/getMyActiveTweets").get(verifyToken, getMyActiveTweets);
router.route("/getMyPrivateTweets").get(verifyToken, getMyPrivateTweets);
router.route("/getMyDeactiveTweets").get(verifyToken, getMyDeactiveTweets);

export default router;
