const mongoose = require("mongoose");

const recurringBillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true
  },
  recurrence: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  lastPaidDate: Date,
  reminderInterval: {
    type: Number, // In hours
    default: 24
  },
  nextReminderDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("RecurringBill", recurringBillSchema);
