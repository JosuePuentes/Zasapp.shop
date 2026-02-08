const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    costPrice: { type: Number, required: true, min: 0 },
    marginPercent: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Farmacia", "Repuestos"],
      trim: true,
    },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    external_id: { type: String, trim: true, sparse: true },
    brand: { type: String, trim: true },
    lot: { type: String, trim: true },
    expiryDate: { type: Date },
    costCurrency: { type: String, enum: ["BCV", "CALLE"], default: "BCV" },
    rateCalleAtCost: { type: Number, min: 0 },
    purchaseCurrencyType: { type: String, enum: ["BCV", "PARALLEL"], default: "BCV" },
    isParallelRate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ store: 1 });
productSchema.index({ store: 1, isParallelRate: 1 });

// Precio venta contable: Precio = Costo Real / (1 - %Utilidad)
productSchema.virtual("finalPrice").get(function () {
  const margin = (this.marginPercent || 0) / 100;
  if (margin >= 1) return this.costPrice;
  return this.costPrice / (1 - margin);
});

module.exports = mongoose.model("Product", productSchema);
