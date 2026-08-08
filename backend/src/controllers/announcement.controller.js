import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Announcement } from "../models/announcement.model.js";

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, category, pinned } = req.body;

  if (!title?.trim() || !content?.trim()) {
    throw new ApiError(400, "Title and content are required");
  }

  const announcement = await Announcement.create({
    title,
    content,
    category,
    pinned: !!pinned,
    postedBy: req.user._id,
    society: req.user.society,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, announcement, "Announcement posted"));
});

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ society: req.user.society })
    .populate("postedBy", "fullName role avatar")
    .sort({ pinned: -1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, announcements, "Announcements fetched"));
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, pinned } = req.body;

  const announcement = await Announcement.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { $set: { title, content, category, pinned } },
    { new: true }
  );

  if (!announcement) throw new ApiError(404, "Announcement not found");

  return res
    .status(200)
    .json(new ApiResponse(200, announcement, "Announcement updated"));
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await Announcement.findOneAndDelete({ _id: id, society: req.user.society });
  if (!announcement) throw new ApiError(404, "Announcement not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Announcement deleted"));
});

export {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
