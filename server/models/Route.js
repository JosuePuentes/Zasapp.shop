const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const routeStopItemSchema = new mongoose.Schema(
  {
    productName: String,
    productId: mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const routeStopSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    storeName: { type: String, trim: true },
    location: { type: pointSchema, required: true },
    items: [routeStopItemSchema],
    completedAt: Date,
  },
  { _id: false }
);

const ROUTE_STATUS = ["PENDING", "ASSIGNED", "AT_STORE", "PICKED_UP", "AT_DESTINATION", "DELIVERED"];

const routeSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stops: [routeStopSchema],
    deliveryLocation: { type: pointSchema, required: true },
    deliveryAddress: { type: String, trim: true },
    status: { type: String, enum: ROUTE_STATUS, default: "PENDING" },
    totalDeliveryFee: { type: Number, min: 0 },
    driverEarnings: { type: Number, min: 0 },
    platformEarnings: { type: Number, min: 0 },
    estimatedDistanceKm: { type: Number, min: 0 },
    estimatedMinutes: { type: Number, min: 0 },
  },
  { timestamps: true }
);

routeSchema.index({ driver: 1, status: 1 });
routeSchema.index({ orderId: 1 });

module.exports = mongoose.model("Route", routeSchema);
module.exports.ROUTE_STATUS = ROUTE_STATUS;
