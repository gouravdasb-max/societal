import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Complaint } from "../models/complaint.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  let imageUrl = "";
  const imageLocalPath = req.file?.path;
  if (imageLocalPath) {
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    if (!uploadedImage?.url) {
      throw new ApiError(500, "Complaint image upload failed");
    }
    imageUrl = uploadedImage.url;
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    raisedBy: req.user._id,
    society: req.user.society,
    imageUrl,
  });

  return res.status(201).json(new ApiResponse(201, complaint, "Complaint raised"));
});

const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ raisedBy: req.user._id, society: req.user.society }).sort({
    createdAt: -1,
  });
  return res.status(200).json(new ApiResponse(200, complaints, "Complaints fetched"));
});

const getAllComplaints = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { society: req.user.society, ...(status ? { status } : {}) };
  const complaints = await Complaint.find(filter)
    .populate("raisedBy", "fullName flatNumber email")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, complaints, "Complaints fetched"));
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminResponse } = req.body;

  const complaint = await Complaint.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { status, adminResponse },
    { new: true }
  );

  if (!complaint) throw new ApiError(404, "Complaint not found");

  return res.status(200).json(new ApiResponse(200, complaint, "Complaint updated"));
});

export { createComplaint, getMyComplaints, getAllComplaints, updateComplaintStatus };
