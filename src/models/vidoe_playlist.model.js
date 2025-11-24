import mongoose, { Schema } from "mongoose";

const videoPlayListSchem = new Schema(
  {
    name: {
      type: String,
      unique: true,
      index: true,
      required: [true, "video_playList name is required"],
    },
    description: {
      type: String,
      index: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const VideoPlaylist = mongoose.model(
  "VideoPlaylist",
  videoPlayListSchem
);
