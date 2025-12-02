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
        "NEW_COMMENT",
        "NEW_LIKE",
        "NEW_VIDEO_FROM_SUBSCRIBED_CHANNLE",
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
