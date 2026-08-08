import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const bookingSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    venue: {
      type: Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
    snapshotName: { type: String, default: "" },
    snapshotFlat: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.plugin(mongooseAggregatePaginate);

bookingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.bookedBy === null) {
      ret.bookedBy = { fullName: ret.snapshotName || "Former Resident", flatNumber: ret.snapshotFlat };
    }
    return ret;
  }
});

export const Booking = mongoose.model("Booking", bookingSchema);
