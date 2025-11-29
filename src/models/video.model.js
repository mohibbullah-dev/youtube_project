import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    video: {
      url: {
        type: String,
        required: [true, "video file is required"],
      },
      public_id: {
        type: String,
        required: [true, "video public_id is required"],
      },
    },
    title: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    description: {
      type: String,
      index: true,
      required: [true, "description is required"],
      trim: true,
      minlength: 1,
    },
    videoDuration: {
      type: Number,
    },
    status: {
      type: "String",
      enum: ["active", "private", "pause"],
      default: "private",
    },
    videoThumbnail: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
