const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  category: String,
  amount: Number,
  description: String,
  date: Date,
  paymentMethod: String,
  isRecurring: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);