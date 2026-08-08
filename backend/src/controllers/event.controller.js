import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, startTime, endTime, location, category } = req.body;

  if (!title?.trim() || !date) {
    throw new ApiError(400, "Title and date are required");
  }

  const event = await Event.create({
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    createdBy: req.user._id,
    society: req.user.society,
  });

  return res.status(201).json(new ApiResponse(201, event, "Event created"));
});

const getEvents = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const filter = { society: req.user.society };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const events = await Event.find(filter)
    .populate("createdBy", "fullName role avatar")
    .sort({ date: 1 });

  return res.status(200).json(new ApiResponse(200, events, "Events fetched"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { $set: req.body },
    { new: true }
  );
  if (!event) throw new ApiError(404, "Event not found");

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findOneAndDelete({ _id: id, society: req.user.society });
  if (!event) throw new ApiError(404, "Event not found");

  return res.status(200).json(new ApiResponse(200, {}, "Event deleted"));
});

export { createEvent, getEvents, updateEvent, deleteEvent };
