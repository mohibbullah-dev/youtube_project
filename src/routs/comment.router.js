import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  commentUpdate,
  createTweetComment,
  createVideoComment,
  deleteComment,
  getVideoComments,
  MyTweetComments,
  MyVideoComments,
} from "../controllers/coment.controller.js";

const router = Router();
router
  .route("/createVideoComment/:videoId")
  .post(verifyToken, createVideoComment);
router
  .route("/createTweetComment/:tweetId")
  .post(verifyToken, createTweetComment);

router.route("/getAllComments").get(verifyToken, getVideoComments);
router.route("/deleteComment/:CommentId").delete(verifyToken, deleteComment);
router.route("/updateComment/:CommentId").put(verifyToken, commentUpdate);
router.route("/getMyVideoComment").get(verifyToken, MyVideoComments);
router.route("/getMytweetComment").get(verifyToken, MyTweetComments);

export default router;
