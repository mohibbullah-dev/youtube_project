import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  subcribToChannel,
  unsubscribeToChannel,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/subscribeTo/:channelId").post(verifyToken, subcribToChannel);
router
  .route("/unsubscribe/:channelId")
  .delete(verifyToken, unsubscribeToChannel);
export default router;
