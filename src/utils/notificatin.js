import { Notification } from "../models/notification.model.js";
import { apiError } from "./apiError.js";

const sendNotification = async (
  actor = "",
  receiver = "",
  type = "",
  entityId = "",
  message = ""
) => {
  try {
    await Notification.create({
      actor: actor,
      receiver: receiver,
      type: type,
      entityId: entityId,
      message: message,
    });
  } catch (error) {
    throw new apiError(500, "notification sending failed");
  }
};

export { sendNotification };
