import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema({
  text: { type: String, required: true, trim: true },
  votes: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const pollSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [optionSchema],
      validate: [(v) => v.length >= 2, "A poll needs at least 2 options"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Poll = mongoose.model("Poll", pollSchema);
