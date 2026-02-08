const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    hasCommission: { type: Boolean, default: false },
    commissionPercent: { type: Number, min: 0, max: 100, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.index({ store: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
