import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["maintenance", "repair", "utility", "event", "salary", "other"],
      default: "other",
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);
