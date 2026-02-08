const mongoose = require("mongoose");

const accountReceivableSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    buyerStore: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["PENDING", "PAID", "PARTIAL"], default: "PENDING" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

accountReceivableSchema.index({ store: 1, buyerStore: 1 });
accountReceivableSchema.index({ store: 1, status: 1 });

module.exports = mongoose.model("AccountReceivable", accountReceivableSchema);
