const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["CLIENT", "VENDOR", "DRIVER", "ADMIN"];

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
    emailIsVerified: { type: Boolean, default: false },
    phoneIsVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
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
