import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
    },
    image: {
      url: {
        type: String,
        required: [true, "image url is required"],
      },
      public_id: {
        type: String,
        required: [true, "image public_id is required"],
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
