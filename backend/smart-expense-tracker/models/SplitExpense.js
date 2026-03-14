const mongoose = require("mongoose");

const splitExpenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidBy: {
    type: String, // Member name who paid
    required: true
  },
  splitBetween: [{
    member: String,
    share: Number
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("SplitExpense", splitExpenseSchema);
