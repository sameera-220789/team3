const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
