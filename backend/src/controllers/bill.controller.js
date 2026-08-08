import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Bill } from "../models/bill.model.js";
import crypto from 'crypto';
import { User } from "../models/user.model.js";
import { Society } from "../models/society.model.js";

const generateBills = asyncHandler(async (req, res) => {
  const { amount, month, year, description } = req.body;

  if (amount == null || !month || !year) {
    throw new ApiError(400, "Amount, month and year are required");
  }

  const billDescription = description || "Monthly rent or maintenance";
  const duplicateCount = await Bill.countDocuments({
    society: req.user.society,
    month,
    year,
    description: billDescription
  });

  if (duplicateCount > 0) {
    throw new ApiError(400, `A bill for '${billDescription}' in month ${month} of ${year} has already been generated!`);
  }

  let residentQuery = {
    society: req.user.society,
    role: "resident",
    isApproved: true,
  };
  
  if (req.body.residentId) {
    residentQuery._id = req.body.residentId;
  }

  const residents = await User.find(residentQuery).select("_id fullName flatNumber");

  if (residents.length === 0) {
    throw new ApiError(400, "No approved residents found to generate bills for");
  }

  const bills = [];
  const errors = [];

  for (const resident of residents) {
    try {
      const bill = await Bill.findOneAndUpdate(
        { society: req.user.society, resident: resident._id, month, year, description: billDescription },
        {
          $setOnInsert: {
            society: req.user.society,
            resident: resident._id,
            amount,
            month,
            year,
            description: billDescription,
            snapshotName: resident.fullName,
            snapshotFlat: resident.flatNumber,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      bills.push(bill);
    } catch (err) {
      errors.push({ resident: resident._id, error: err.message });
    }
  }

  return res.status(201).json(
    new ApiResponse(201, { generated: bills.length, errors: errors.length }, `Bills generated for ${bills.length} residents`)
  );
});

const getMyBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find({
    resident: req.user._id,
    society: req.user.society,
  }).sort({ year: -1, month: -1 }).populate("society", "upiId name");

  return res.status(200).json(new ApiResponse(200, bills, "Your bills fetched"));
});

const getAllBills = asyncHandler(async (req, res) => {
  const { month, year, status } = req.query;
  const filter = { society: req.user.society };
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);
  if (status) filter.status = status;

  const bills = await Bill.find(filter)
    .populate("resident", "fullName flatNumber email phone")
    .sort({ year: -1, month: -1, createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, bills, "Bills fetched"));
});

const markBillPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await Bill.findOneAndUpdate(
    { _id: id, society: req.user.society },
    { status: "paid", paidAt: new Date() },
    { returnDocument: 'after' }
  ).populate("resident", "fullName flatNumber");

  if (!bill) throw new ApiError(404, "Bill not found");

  return res.status(200).json(new ApiResponse(200, bill, "Bill marked as paid"));
});

const markBillOverdue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await Bill.findOneAndUpdate(
    { _id: id, society: req.user.society, status: "pending" },
    { status: "overdue" },
    { returnDocument: 'after' }
  ).populate("resident", "fullName flatNumber");

  if (!bill) throw new ApiError(404, "Bill not found or not pending");

  return res.status(200).json(new ApiResponse(200, bill, "Bill marked as overdue"));
});

const rejectBillVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bill = await Bill.findOneAndUpdate(
    { _id: id, society: req.user.society, status: "verification_pending" },
    { status: "pending", transactionId: "" },
    { returnDocument: 'after' }
  ).populate("resident", "fullName flatNumber");

  if (!bill) throw new ApiError(404, "Bill not found or not pending verification");

  return res.status(200).json(new ApiResponse(200, bill, "Payment rejected and marked as unpaid"));
});

const payMyBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  if (!transactionId || transactionId.trim() === "") {
    throw new ApiError(400, "Please provide the bank transaction (UTR) reference number.");
  }

  const bill = await Bill.findOne({
    _id: id,
    resident: req.user._id,
    society: req.user.society,
  });

  if (!bill) throw new ApiError(404, "Bill not found");
  if (bill.status === "paid") throw new ApiError(400, "This bill is already paid");
  if (bill.status === "verification_pending") throw new ApiError(400, "Bill is already pending verification.");

  bill.transactionId = transactionId.trim();
  bill.status = "verification_pending";
  await bill.save();
  return res.status(200).json(
    new ApiResponse(200, bill, "Payment submitted for admin verification")
  );
});

export {
  generateBills,
  getMyBills,
  getAllBills,
  markBillPaid,
  markBillOverdue,
  rejectBillVerification,
  payMyBill
};
