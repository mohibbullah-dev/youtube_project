import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORSE_ORGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// routes starts from here
import userRouter from "./routs/user.router.js";
import videoRouter from "./routs/video.router.js";
import subcriptionRouter from "./routs/subscription.router.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscription", subcriptionRouter);

export { app };
