import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";

const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, month, year, description } = req.body;

  if (!title?.trim() || amount == null || !month || !year) {
    throw new ApiError(400, "Title, amount, month and year are required");
  }

  const expense = await Expense.create({
    title,
    amount,
    category,
    month,
    year,
    description,
    createdBy: req.user._id,
    society: req.user.society,
  });

  return res.status(201).json(new ApiResponse(201, expense, "Expense logged"));
});

const getExpenses = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const filter = { society: req.user.society };
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);

  const expenses = await Expense.find(filter)
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched"));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findOneAndDelete({ _id: id, society: req.user.society });
  if (!expense) throw new ApiError(404, "Expense not found");

  return res.status(200).json(new ApiResponse(200, {}, "Expense deleted"));
});

export { createExpense, getExpenses, deleteExpense };
