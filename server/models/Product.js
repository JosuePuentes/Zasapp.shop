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
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ store: 1 });

// Precio final = costo + utilidad (para uso en resolvers)
productSchema.virtual("finalPrice").get(function () {
  return this.costPrice * (1 + (this.marginPercent || 0) / 100);
});

module.exports = mongoose.model("Product", productSchema);
