import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.model.js";
import { Venue } from "../models/venue.model.js";
const createBooking = asyncHandler(async (req, res) => {
  const { venue, date, startTime, endTime, purpose } = req.body;

  if (!venue || !date || !startTime || !endTime) {
    throw new ApiError(400, "Venue, date, start time and end time are required");
  }

  const venueExists = await Venue.findOne({ _id: venue, society: req.user.society });
  if (!venueExists) throw new ApiError(404, "Venue not found");
  const clash = await Booking.findOne({
    venue,
    society: req.user.society,
    date: new Date(date),
    status: { $in: ["pending", "approved"] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });

  if (clash) {
    throw new ApiError(409, "This venue is already booked/requested for the selected time slot");
  }

  const booking = await Booking.create({
    venue,
    date,
    startTime,
    endTime,
    purpose,
    bookedBy: req.user._id,
    society: req.user.society,
    snapshotName: req.user.fullName,
    snapshotFlat: req.user.flatNumber,
  });

  const populated = await booking.populate("venue", "name");

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Booking request submitted"));
});
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ bookedBy: req.user._id, society: req.user.society })
    .populate("venue", "name image")
    .sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Your bookings fetched"));
});
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findOne({ _id: id, bookedBy: req.user._id, society: req.user.society });
  if (!booking) throw new ApiError(404, "Booking not found");

  booking.status = "cancelled";
  await booking.save();

  return res.status(200).json(new ApiResponse(200, booking, "Booking cancelled"));
});
const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { society: req.user.society };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("venue", "name")
    .populate("bookedBy", "fullName flatNumber email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, bookings, "Bookings fetched"));
});
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be 'approved' or 'rejected'");
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { status, adminNote },
    { new: true }
  ).populate("venue", "name").populate("bookedBy", "fullName email");

  if (!booking) throw new ApiError(404, "Booking not found");

  return res.status(200).json(new ApiResponse(200, booking, `Booking ${status}`));
});

export {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
