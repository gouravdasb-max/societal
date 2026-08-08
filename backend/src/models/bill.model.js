import mongoose, { Schema } from "mongoose";

const billSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    resident: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
      default: "Monthly maintenance",
    },
    status: {
      type: String,
      enum: ["pending", "verification_pending", "paid", "overdue"],
      default: "pending",
    },
    orderId: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    snapshotName: { type: String, default: "" },
    snapshotFlat: { type: String, default: "" },
  },
  { timestamps: true }
);

billSchema.index({ society: 1, resident: 1, month: 1, year: 1, description: 1 }, { unique: true });

billSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.resident === null) {
      ret.resident = { fullName: ret.snapshotName || "Former Resident", flatNumber: ret.snapshotFlat };
    }
    return ret;
  }
});

export const Bill = mongoose.model("Bill", billSchema);
