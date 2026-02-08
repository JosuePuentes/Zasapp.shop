const mongoose = require("mongoose");

const b2bChatMessageSchema = new mongoose.Schema(
  {
    fromStore: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    toStore: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    body: { type: String, required: true, trim: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

b2bChatMessageSchema.index({ fromStore: 1, toStore: 1, createdAt: -1 });
b2bChatMessageSchema.index({ toStore: 1, fromStore: 1, createdAt: -1 });

module.exports = mongoose.model("B2BChatMessage", b2bChatMessageSchema);
