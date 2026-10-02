const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Electronics", "Documents", "Clothing", "Accessories", "Other"],
      required: true,
    },
    locationFound: { type: String, required: true, trim: true },
    dateFound: { type: Date, default: Date.now },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["Available", "Claimed"], default: "Available" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);