import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { subcribToChannel } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/subscribeTo/:channelId").post(verifyToken, subcribToChannel);
export default router;
