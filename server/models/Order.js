const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    productName: String,
    quantity: { type: Number, default: 1 },
    price: Number,
  },
  { _id: false }
);

const ORDER_STATUS = [
  "PENDING",
  "ACCEPTED",
  "ASSIGNED",
  "AT_STORE",
  "PICKED_UP",
  "AT_DESTINATION",
  "DELIVERED",
  "CANCELLED",
];

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    deliveryAddress: { type: String, trim: true },
    deliveryLocation: { type: pointSchema },
    totalAmount: { type: Number, min: 0 },
    deliveryFee: { type: Number, min: 0 },
    status: { type: String, enum: ORDER_STATUS, default: "PENDING" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  },
  { timestamps: true }
);

orderSchema.index({ client: 1 });
orderSchema.index({ driver: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUS = ORDER_STATUS;
