import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Poll } from "../models/poll.model.js";

const createPoll = asyncHandler(async (req, res) => {
  const { question, options, expiresAt } = req.body;

  if (!question?.trim()) throw new ApiError(400, "Question is required");
  if (!Array.isArray(options) || options.length < 2) {
    throw new ApiError(400, "At least 2 options are required");
  }

  const poll = await Poll.create({
    question,
    options: options.map((text) => ({ text: text.trim(), votes: [] })),
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
    society: req.user.society,
  });

  return res.status(201).json(new ApiResponse(201, poll, "Poll created"));
});

const getPolls = asyncHandler(async (req, res) => {
  const polls = await Poll.find({ society: req.user.society })
    .populate("createdBy", "fullName role avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, polls, "Polls fetched"));
});

const vote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;

  if (!optionId) throw new ApiError(400, "Option ID is required");

  const poll = await Poll.findOne({ _id: id, society: req.user.society });
  if (!poll) throw new ApiError(404, "Poll not found");
  if (poll.isClosed) throw new ApiError(400, "This poll is closed");
  if (poll.expiresAt && new Date() > poll.expiresAt) {
    throw new ApiError(400, "This poll has expired");
  }
  const alreadyVoted = poll.options.some((opt) =>
    opt.votes.some((v) => v.toString() === req.user._id.toString())
  );
  if (alreadyVoted) throw new ApiError(400, "You have already voted on this poll");

  const option = poll.options.id(optionId);
  if (!option) throw new ApiError(404, "Option not found");

  option.votes.push(req.user._id);
  await poll.save();

  return res.status(200).json(new ApiResponse(200, poll, "Vote recorded"));
});

const closePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const poll = await Poll.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { isClosed: true },
    { new: true }
  );
  if (!poll) throw new ApiError(404, "Poll not found");

  return res.status(200).json(new ApiResponse(200, poll, "Poll closed"));
});

const deletePoll = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const poll = await Poll.findOneAndDelete({ _id: id, society: req.user.society });
  if (!poll) throw new ApiError(404, "Poll not found");

  return res.status(200).json(new ApiResponse(200, {}, "Poll deleted"));
});

export { createPoll, getPolls, vote, closePoll, deletePoll };
