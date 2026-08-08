import mongoose, { Schema } from "mongoose";

const MAX_VALIDITY_DAYS = 30;

const gatePassSchema = new Schema(
  {
    society: { type: Schema.Types.ObjectId, ref: "Society", required: true, index: true },
    visitorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    visitorPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
      validate: {
        validator: function (val) {
          if (!this.validFrom) return true;
          const diff = (val - this.validFrom) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= MAX_VALIDITY_DAYS;
        },
        message: `Gate pass validity cannot exceed ${MAX_VALIDITY_DAYS} days`,
      },
    },
    purpose: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
    },
    qrCode: {
      type: String,
      default: "",
    },
    scannedAt: {
      type: Date,
      default: null,
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    snapshotName: { type: String, default: "" },
    snapshotFlat: { type: String, default: "" },
  },
  { timestamps: true }
);

gatePassSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret.createdBy === null) {
      ret.createdBy = { fullName: ret.snapshotName || "Former Resident", flatNumber: ret.snapshotFlat };
    }
    return ret;
  }
});

export const GatePass = mongoose.model("GatePass", gatePassSchema);
