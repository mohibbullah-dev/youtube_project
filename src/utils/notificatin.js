import { Notification } from "../models/notification.model.js";
import { apiError } from "./apiError.js";

const sendNotification = async (
  acotr = "",
  receiver = "",
  type = "",
  entityId = "",
  message = ""
) => {
  try {
    await Notification.create({
      acotr,
      receiver,
      type,
      entityId,
      message,
    });
  } catch (error) {
    throw new apiError(500, "notification sending faild");
  }
};

export { sendNotification };
