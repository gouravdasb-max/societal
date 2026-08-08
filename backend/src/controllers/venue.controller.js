import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Venue } from "../models/venue.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createVenue = asyncHandler(async (req, res) => {
  const { name, description, capacity, openTime, closeTime } = req.body;

  if (!name?.trim()) throw new ApiError(400, "Venue name is required");

  let imageUrl = "";
  const localPath = req.file?.path;
  if (localPath) {
    const uploaded = await uploadOnCloudinary(localPath);
    imageUrl = uploaded?.url || "";
  }

  const venue = await Venue.create({
    name,
    description,
    capacity,
    openTime,
    closeTime,
    image: imageUrl,
    society: req.user.society,
  });

  return res.status(201).json(new ApiResponse(201, venue, "Venue added"));
});

const getVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find({ society: req.user.society, isActive: true }).sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, venues, "Venues fetched"));
});

const updateVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const venue = await Venue.findOneAndUpdate({ _id: id, society: req.user.society }, { $set: req.body }, { new: true });
  if (!venue) throw new ApiError(404, "Venue not found");
  return res.status(200).json(new ApiResponse(200, venue, "Venue updated"));
});

const deleteVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const venue = await Venue.findOneAndUpdate({ _id: id, society: req.user.society }, { isActive: false }, { new: true });
  if (!venue) throw new ApiError(404, "Venue not found");
  return res.status(200).json(new ApiResponse(200, {}, "Venue removed"));
});

export { createVenue, getVenues, updateVenue, deleteVenue };
