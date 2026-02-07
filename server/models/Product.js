const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["Farmacia", "Repuestos"],
      trim: true,
    },
    external_id: {
      type: String,
      trim: true,
      sparse: true,
      comment: "Código de barras u otro ID externo (ej. farmacia)",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
