const mongoose = require("mongoose");

const STATUS = ["PENDING", "APPROVED", "REJECTED"];
const DEPARTMENT_SLUG = {
  Farmacia: "Farma",
  Repuestos: "Repuestos",
  Otro: "Sede",
};

const BRAND_COLOR_PALETTE = [
  "#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899",
  "#14b8a6", "#eab308", "#ef4444", "#06b6d4", "#84cc16",
];

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: STATUS,
      default: "PENDING",
    },
    isActive: { type: Boolean, default: true },
    department: {
      type: String,
      trim: true,
      enum: ["Farmacia", "Repuestos", "Otro"],
      default: "Otro",
    },
    location: { type: pointSchema },
    publicName: { type: String, trim: true },
    brandColor: { type: String, trim: true },
  },
  { timestamps: true }
);

storeSchema.index({ location: "2dsphere" });
storeSchema.index({ department: 1, createdAt: 1 });

storeSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const dept = this.department || "Otro";
  const slug = DEPARTMENT_SLUG[dept] || "Sede";
  const count = await this.constructor.countDocuments({ department: dept });
  this.publicName = `${String(count + 1).padStart(2, "0")}${slug}Zas!`;
  const total = await this.constructor.countDocuments();
  this.brandColor = BRAND_COLOR_PALETTE[total % BRAND_COLOR_PALETTE.length];
  next();
});

module.exports = mongoose.model("Store", storeSchema);
module.exports.STATUS = STATUS;
module.exports.BRAND_COLOR_PALETTE = BRAND_COLOR_PALETTE;
