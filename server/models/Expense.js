const mongoose = require("mongoose");

const EXPENSE_CATEGORY = ["OPERATING", "UTILITIES", "RENT", "SALARIES", "OTHER"];

const expenseSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, enum: EXPENSE_CATEGORY, default: "OTHER" },
    expenseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

expenseSchema.index({ store: 1 });
expenseSchema.index({ store: 1, expenseDate: -1 });

module.exports = mongoose.model("Expense", expenseSchema);
module.exports.EXPENSE_CATEGORY = EXPENSE_CATEGORY;
