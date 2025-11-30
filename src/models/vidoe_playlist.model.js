import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

videoPlayListSchem.plugin(mongooseAggregatePaginate);

export const VideoPlaylist = mongoose.model(
  "VideoPlaylist",
  videoPlayListSchem
);
