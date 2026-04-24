import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
  },
  { timestamps: true }
);

export const Budget = mongoose.models.Budget || mongoose.model("Budget", budgetSchema);