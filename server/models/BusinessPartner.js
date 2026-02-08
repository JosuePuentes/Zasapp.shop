const mongoose = require("mongoose");

const businessPartnerSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    partnerStore: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    isApproved: { type: Boolean, default: false },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    creditDays: { type: Number, min: 0, default: 0 },
    creditLimit: { type: Number, min: 0, default: 0 },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

businessPartnerSchema.index({ store: 1, partnerStore: 1 }, { unique: true });
businessPartnerSchema.index({ partnerStore: 1 });

module.exports = mongoose.model("BusinessPartner", businessPartnerSchema);
