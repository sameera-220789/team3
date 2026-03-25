const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ""
  },
  note: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  bankDetails: {
    type: String,
    default: ""
  },
  paymentMode: {
    type: String,
    enum: ["mobile", "bank", "qr"],
    default: "mobile"
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "success"
  },
  expenseId: {
    type: String,          // ID of the auto-generated expense in the Expense Tracker
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
