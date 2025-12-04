import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_SUBSCRIBER",
        "UNSUBSCRIBED",
        "NEW_VIDEO_COMMENT",
        "VIDEO_COMMENT_DELELTE",
        "NEW_TWEET_COMMENT",
        "TWEET_COMMENT_DELELTE",
        "VIDEO_COMMENT_UPDATE",
        "TWEET_COMMENT_UPDATE",
        "NEW_VIDEO_LIKE",
        "NEW_TWEET_LIKE",
        "NEW_COMMENT_LIKE",
        "NEW_VIDEO_FROM_SUBSCRIBED_CHANNLE",
        "USER_MENTIONED_IN_VIDEO",
        "USER_MENTIONED_IN_COMMENT",
      ],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
