import mongoose, { Schema } from "mongoose";

const venueSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    openTime: {
      type: String,
      default: "08:00",
    },
    closeTime: {
      type: String,
      default: "22:00",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Venue = mongoose.model("Venue", venueSchema);
