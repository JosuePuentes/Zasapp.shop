const mongoose = require("mongoose");

const STATUS = ["PENDING", "APPROVED", "REJECTED"];

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: STATUS,
      default: "PENDING",
    },
    isActive: { type: Boolean, default: true },
    department: {
      type: String,
      trim: true,
      enum: ["Farmacia", "Repuestos", "Otro"],
      default: "Otro",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
module.exports.STATUS = STATUS;
