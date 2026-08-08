import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";
import { Bill } from "../models/bill.model.js";
import { Booking } from "../models/booking.model.js";
import { Complaint } from "../models/complaint.model.js";
import { Event } from "../models/event.model.js";
import { Expense } from "../models/expense.model.js";
import { GatePass } from "../models/gatepass.model.js";
import { Message } from "../models/message.model.js";
import { Poll } from "../models/poll.model.js";
import { Venue } from "../models/venue.model.js";
import { Announcement } from "../models/announcement.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import { sendAdminOtpEmail } from "../utils/email.js";
const getAllResidents = asyncHandler(async (req, res) => {
  const { status } = req.query; // "pending" | "approved"
  const filter = { role: "resident", society: req.user.society };
  if (status === "pending") filter.isApproved = false;
  if (status === "approved") filter.isApproved = true;

  const residents = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, residents, "Residents fetched"));
});
const approveResident = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOneAndUpdate(
    { _id: userId, role: "resident", society: req.user.society },
    { isApproved: true },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Resident approved"));
});
const removeResident = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOneAndDelete({ _id: userId, role: "resident", society: req.user.society });
  if (!user) throw new ApiError(404, "Resident not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Resident removed"));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("society", "name city inviteCode")
    .select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const updates = {};
  if (fullName?.trim()) updates.fullName = fullName.trim();
  if (phone !== undefined) updates.phone = phone.trim();

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;
  if (!localPath) throw new ApiError(400, "Avatar image is required");

  const uploaded = await uploadOnCloudinary(localPath);
  if (!uploaded?.url) throw new ApiError(500, "Failed to upload avatar");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: uploaded.url },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
});
const getResidentDirectory = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {
    role: "resident",
    society: req.user.society,
    isApproved: true,
  };

  if (search?.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { fullName: regex },
      { flatNumber: regex },
    ];
  }

  const residents = await User.find(filter)
    .select("fullName flatNumber phone avatar")
    .sort({ fullName: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, residents, "Directory fetched"));
});
const getAllGuards = asyncHandler(async (req, res) => {
  const guards = await User.find({
    role: "guard",
    society: req.user.society,
  })
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, guards, "Guards fetched"));
});
const removeGuard = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOneAndDelete({
    _id: userId,
    role: "guard",
    society: req.user.society,
  });
  if (!user) throw new ApiError(404, "Guard not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Guard removed"));
});

const getSocietySettings = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.user.society);
  if (!society) throw new ApiError(404, "Society not found");
  
  return res.status(200).json(new ApiResponse(200, {
    upiId: society.upiId,
  }, "Settings fetched"));
});

const updateSocietySettings = asyncHandler(async (req, res) => {
  const { upiId } = req.body;
  const society = await Society.findByIdAndUpdate(
    req.user.society,
    { upiId },
    { new: true }
  );
  if (!society) throw new ApiError(404, "Society not found");
  
  return res.status(200).json(new ApiResponse(200, null, "Payment settings updated successfully"));
});

const deleteProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "admin") {
    const otp = req.body?.otp;
    
    if (!otp) {
      const generatedOtp = crypto.randomInt(100000, 1000000).toString();
      user.loginOtp = crypto.createHash("sha256").update(generatedOtp).digest("hex");
      user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
      user.loginOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      await sendAdminOtpEmail({ email: user.email, fullName: user.fullName, otp: generatedOtp, purpose: 'Destroy Society' });
      return res.status(200).json(new ApiResponse(200, { requiresOtp: true }, "OTP sent to verify Destroy Society"));
    }

    if (!user.loginOtpExpires || user.loginOtpExpires <= new Date() || user.loginOtpAttempts >= 5) {
      throw new ApiError(400, "Invalid or expired OTP");
    }
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.loginOtp) {
      user.loginOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, "Incorrect OTP");
    }

    const societyId = user.society;
    if (societyId) {
      await Bill.deleteMany({ society: societyId });
      await Booking.deleteMany({ society: societyId });
      await Complaint.deleteMany({ society: societyId });
      await Event.deleteMany({ society: societyId });
      await Expense.deleteMany({ society: societyId });
      await GatePass.deleteMany({ society: societyId });
      await Message.deleteMany({ society: societyId });
      await Poll.deleteMany({ society: societyId });
      await Venue.deleteMany({ society: societyId });
      await Announcement.deleteMany({ society: societyId });
      await User.deleteMany({ society: societyId });
      await Society.findByIdAndDelete(societyId);
    }
  } else {
    await User.findByIdAndDelete(user._id);
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Profile deleted and left society successfully")
  );
});

export { getAllResidents, approveResident, removeResident, getProfile, updateProfile, updateAvatar, getResidentDirectory, deleteProfile, getAllGuards, removeGuard, getSocietySettings, updateSocietySettings };
