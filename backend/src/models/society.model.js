import mongoose, { Schema } from "mongoose";

const societySchema = new Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, trim: true, default: "" },
  inviteCode: { type: String, required: true, unique: true, uppercase: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  upiId: { type: String, default: "" },
}, { timestamps: true });

export const Society = mongoose.model("Society", societySchema);
