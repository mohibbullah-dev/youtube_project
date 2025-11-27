import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likeOn: {
    type: Schema.Types.ObjectId,
    refPath: "onModel",
    required: true,
  },
  modelOn: {
    type: String,
    enum: ["Video", "Tweet", "Comment"],
    required: true,
  },
});
export const LiKe = mongoose.model("LiKe", likeSchema);
