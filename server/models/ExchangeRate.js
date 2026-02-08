const mongoose = require("mongoose");

const exchangeRateSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    rateBcv: { type: Number, required: true, min: 0 },
    rateCalle: { type: Number, required: true, min: 0 },
    effectiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

exchangeRateSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model("ExchangeRate", exchangeRateSchema);
