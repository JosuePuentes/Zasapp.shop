const mongoose = require("mongoose");

const STATUS = ["PENDING", "PAID", "PARTIAL", "OVERDUE"];

const accountPayableSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: STATUS, default: "PENDING" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

accountPayableSchema.index({ store: 1 });
accountPayableSchema.index({ supplier: 1 });
accountPayableSchema.index({ store: 1, status: 1 });

module.exports = mongoose.model("AccountPayable", accountPayableSchema);
module.exports.STATUS = STATUS;
