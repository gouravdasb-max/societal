import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    room: {
      type: String,
      required: true,
      default: "community",
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
