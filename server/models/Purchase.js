const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    lot: { type: String, trim: true },
    expiryDate: { type: Date },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [purchaseItemSchema],
    total: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

purchaseSchema.index({ store: 1 });
purchaseSchema.index({ store: 1, purchaseDate: -1 });
purchaseSchema.index({ supplier: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);
