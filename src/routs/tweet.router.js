import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";
import { uploadImage } from "../middlewares/multer.middleware.js";

const router = Router();
router
  .route("/createTweet")
  .post(verifyToken, uploadImage.single("image"), createTweet);
export default router;
