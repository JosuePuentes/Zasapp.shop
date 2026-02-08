const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    rif: { type: String, trim: true },
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

supplierSchema.index({ store: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);
