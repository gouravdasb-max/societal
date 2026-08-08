import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GatePass } from "../models/gatepass.model.js";
import { generateQRCode, uploadQRToCloudinary } from "../utils/qrCode.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const MAX_VALIDITY_DAYS = 30;

const createGatePass = asyncHandler(async (req, res) => {
  const { visitorName, visitorPhone, validFrom, validTo, purpose } = req.body;

  if (!visitorName?.trim() || !validFrom || !validTo) {
    throw new ApiError(400, "Visitor name, valid-from and valid-to dates are required");
  }

  const from = new Date(validFrom);
  const to = new Date(validTo);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  if (to < from) {
    throw new ApiError(400, "Valid-to date must be after valid-from date");
  }
  const diffDays = (to - from) / (1000 * 60 * 60 * 24);
  if (diffDays > MAX_VALIDITY_DAYS) {
    throw new ApiError(400, `Gate pass validity cannot exceed ${MAX_VALIDITY_DAYS} days`);
  }
  if (from < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new ApiError(400, "Valid-from date cannot be in the past");
  }

  const pass = await GatePass.create({
    visitorName: visitorName.trim(),
    visitorPhone: visitorPhone?.trim() || "",
    validFrom: from,
    validTo: to,
    purpose: purpose?.trim() || "",
    createdBy: req.user._id,
    society: req.user.society,
    snapshotName: req.user.fullName,
    snapshotFlat: req.user.flatNumber,
  });
  try {
    const qrData = JSON.stringify({
      passId: pass._id.toString(),
      visitorName: pass.visitorName,
      validFrom: pass.validFrom,
      validTo: pass.validTo,
    });

    const qrDataUrl = await generateQRCode(qrData);
    const qrUrl = await uploadQRToCloudinary(qrDataUrl, uploadOnCloudinary);

    if (qrUrl) {
      pass.qrCode = qrUrl;
      await pass.save();
    }
  } catch (qrError) {
    console.error("QR generation warning:", qrError.message);
  }

  return res.status(201).json(new ApiResponse(201, pass, "Gate pass created"));
});

const getMyPasses = asyncHandler(async (req, res) => {
  const passes = await GatePass.find({
    createdBy: req.user._id,
    society: req.user.society,
  }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, passes, "Your gate passes fetched"));
});

const getAllPasses = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { society: req.user.society };
  if (status) filter.status = status;

  const passes = await GatePass.find(filter)
    .populate("createdBy", "fullName flatNumber email")
    .sort({ validFrom: -1 });

  return res.status(200).json(new ApiResponse(200, passes, "Gate passes fetched"));
});

const updatePassStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "used", "expired", "cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const pass = await GatePass.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { status },
    { new: true }
  );
  if (!pass) throw new ApiError(404, "Gate pass not found");

  return res.status(200).json(new ApiResponse(200, pass, "Gate pass updated"));
});

const cancelMyPass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pass = await GatePass.findOneAndUpdate(
    { _id: id, createdBy: req.user._id, society: req.user.society, status: "active" },
    { status: "cancelled" },
    { new: true }
  );
  if (!pass) throw new ApiError(404, "Gate pass not found or already used/cancelled");

  return res.status(200).json(new ApiResponse(200, pass, "Gate pass cancelled"));
});

const scanGatePass = asyncHandler(async (req, res) => {
  const { passId } = req.body;

  if (!passId?.trim()) {
    throw new ApiError(400, "Pass ID is required");
  }

  const pass = await GatePass.findOne({
    _id: passId,
    society: req.user.society,
  }).populate("createdBy", "fullName flatNumber phone");

  if (!pass) {
    throw new ApiError(404, "Gate pass not found");
  }
  const now = new Date();
  
  const passFrom = new Date(pass.validFrom);
  passFrom.setHours(0, 0, 0, 0); // Treat validity as beginning at midnight
  
  const passTo = new Date(pass.validTo);
  passTo.setHours(23, 59, 59, 999); // Treat validity as ending at the very end of the day

  if (passFrom > now) {
    throw new ApiError(400, "This pass is not yet valid");
  }
  if (passTo < now) {
    throw new ApiError(400, "This pass has expired");
  }
  if (pass.status === "used") {
    throw new ApiError(400, "This pass has already been used");
  }
  if (pass.status === "cancelled") {
    throw new ApiError(400, "This pass has been cancelled");
  }
  pass.status = "used";
  pass.scannedAt = now;
  pass.scannedBy = req.user._id;
  await pass.save();

  return res.status(200).json(
    new ApiResponse(200, pass, "Gate pass verified and entry granted")
  );
});

const getGuardScanHistory = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { society: req.user.society, scannedBy: req.user._id };

  if (startDate || endDate) {
    filter.scannedAt = {};
    if (startDate) filter.scannedAt.$gte = new Date(startDate);
    if (endDate) filter.scannedAt.$lte = new Date(endDate);
  }

  const history = await GatePass.find(filter)
    .populate("createdBy", "fullName flatNumber email")
    .sort({ scannedAt: -1 });

  return res.status(200).json(new ApiResponse(200, history, "Scan history fetched"));
});

export { createGatePass, getMyPasses, getAllPasses, updatePassStatus, cancelMyPass, scanGatePass, getGuardScanHistory };
