const mongoose = require("mongoose");

const DRIVER_PERCENT = 92;
const PLATFORM_PERCENT = 8;

const transactionSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    totalDeliveryFee: { type: Number, required: true, min: 0 },
    driverAmount: { type: Number, required: true, min: 0 },
    platformAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const deliveryWalletSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    platformShareTotal: { type: Number, default: 0, min: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

deliveryWalletSchema.index({ driver: 1 });

function splitFee(totalFee) {
  const driverAmount = Math.round((totalFee * DRIVER_PERCENT) / 100 * 100) / 100;
  const platformAmount = Math.round((totalFee * PLATFORM_PERCENT) / 100 * 100) / 100;
  return { driverAmount, platformAmount };
}

module.exports = mongoose.model("DeliveryWallet", deliveryWalletSchema);
module.exports.DRIVER_PERCENT = DRIVER_PERCENT;
module.exports.PLATFORM_PERCENT = PLATFORM_PERCENT;
module.exports.splitFee = splitFee;
