import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
    },
    status: {
      type: "String",
      enum: ["active", "private", "deActive"],
      default: "private",
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

tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
