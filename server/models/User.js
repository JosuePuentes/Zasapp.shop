const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["CLIENT", "VENDOR", "DRIVER", "ADMIN"];
const VEHICLE_TYPES = ["Moto", "Car"];
const DRIVER_VERIFICATION_STATUS = ["PENDING", "VERIFIED", "REJECTED"];

const driverProfileSchema = new mongoose.Schema(
  {
    vehicleBrand: { type: String, trim: true },
    vehicleModel: { type: String, trim: true },
    vehicleYear: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    vehicleType: { type: String, enum: VEHICLE_TYPES },
    documents: {
      license: { type: String, trim: true },
      medicalCert: { type: String, trim: true },
      circulationCard: { type: String, trim: true },
      plate: { type: String, trim: true },
    },
    verificationStatus: {
      type: String,
      enum: DRIVER_VERIFICATION_STATUS,
      default: "PENDING",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    deliveryAddress: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ROLES,
      default: "CLIENT",
    },
    clientType: { type: String, enum: ["PERSONAL", "EMPRESA"], default: "PERSONAL" },
    emailIsVerified: { type: Boolean, default: false },
    phoneIsVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    driverProfile: { type: driverProfileSchema },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
module.exports.DRIVER_VERIFICATION_STATUS = DRIVER_VERIFICATION_STATUS;
