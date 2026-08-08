import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";
const getMessages = asyncHandler(async (req, res) => {
  const room = `society:${req.user.society}`;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  const messages = await Message.find({ room, society: req.user.society })
    .populate("sender", "fullName role avatar")
    .sort({ createdAt: -1 })
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, messages.reverse(), "Messages fetched"));
});

export { getMessages };
