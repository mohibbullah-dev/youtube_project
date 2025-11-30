import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
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

likeSchema.plugin(mongooseAggregatePaginate);
export const LiKe = mongoose.model("LiKe", likeSchema);
