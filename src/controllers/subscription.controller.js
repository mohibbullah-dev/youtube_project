import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendNotification } from "../utils/notificatin.js";

const subcribToChannel = asyncHandler(async (req, res) => {
  // take the logedin-user from req.user.id who want to subscribe
  // take the channel_id who is channel owner from req.params
  // check them empty or not
  // check the both user the same or not because user cannot subscribe to own channel
  // check if already subscribed to this channel or not
  // created a subscription document to subscription collection
  //  finally return response

  const subscriberid = req.user?.id;
  const channelId = req.params?.channelId;

  if (!subscriberid || !channelId)
    throw new apiError(400, "subscriber & channel are required");
  if (subscriberid === channelId)
    throw new apiError(400, "cannot be subscribed in own channel");

  const exists = await Subscription.findOne({
    subscriber: subscriberid,
    channel: channelId,
  });

  if (!exists) {
    const subcribed = await Subscription.create({
      subscriber: subscriberid,
      channel: channelId,
    });
    if (!subcribed)
      throw new apiError(500, "something went wrong while subcribing");

    await sendNotification(
      subscriberid,
      channelId,
      "NEW_SUBSCRIBER",
      subcribed._id,
      "someone subscribed your channel"
    );
    return res
      .status(201)
      .json(new apiResponse(200, subcribed, "subscribed succefully"));
  }
});

const unsubscribeToChannel = asyncHandler(async (req, res) => {
  // take the logedin-user from req.user.id who want to subscribe
  // take the channel_id who is channel owner from req.params
  // check them empty or not
  // findAndDelete data to database
  // check the database response
  // return a response to user

  const subscriberId = req.user?.id;
  const channelId = req.params?.channelId;
  if (!subscriberId || !channelId)
    throw new apiError(400, "subscriber & channel is required");
  const unsubscribe = await Subscription.findOneAndDelete({
    subscriber: subscriberId,
    channel: channelId,
  });
  if (!unsubscribe) throw new apiError(404, "subscriber not found");

  await sendNotification(
    subscriberId,
    channelId,
    "UNSUBSCRIBED",
    unsubscribe._id,
    "someone unsubscribed you"
  );

  return res
    .status(204)
    .json(new apiResponse(200, unsubscribe, "unsubscribed succefully"));
});

export { subcribToChannel, unsubscribeToChannel };
