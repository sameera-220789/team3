const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be ObjectId string or "demo"
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
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
