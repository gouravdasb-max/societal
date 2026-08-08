import mongoose, { Schema } from "mongoose";

const complaintSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "security", "cleanliness", "other"],
      default: "other",
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    adminResponse: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
