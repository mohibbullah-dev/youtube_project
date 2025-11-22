import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../middlewares/multer.middleware.js";
import { uploadYoutubeVideo } from "../controllers/video.controller.js";
const router = Router();

router.route("/upload-video").post(
  verifyToken,
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnai", maxCount: 1 },
  ]),
  uploadYoutubeVideo
);

export default router;
