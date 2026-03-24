const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  goalName: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  savedAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing"
  }
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);
