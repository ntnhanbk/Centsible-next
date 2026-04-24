import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "briefcase" },
    color: { type: String, default: "#888888" },
    type: { type: String, enum: ["income", "expense"], required: true },
    isFixed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);