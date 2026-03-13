const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["milestone", "limit_reached", "category_exceeded"],
    required: true
  },
  threshold: {
    type: Number, // 50, 90, 100
    default: null
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);
