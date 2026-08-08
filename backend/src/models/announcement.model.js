import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "maintenance", "event", "urgent"],
      default: "general",
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
