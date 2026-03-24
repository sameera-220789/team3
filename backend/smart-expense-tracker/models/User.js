const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null   // null for OAuth users
  },
  currency: {
    type: String,
    default: 'INR'
  },
  provider: {
    type: String,
    default: 'local'  // 'local' | 'google' | 'github'
  },
  providerId: {
    type: String,
    default: null
  },
  picture: {
    type: String,
    default: null
  },
  totalSavings: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);