// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");

// const connectDB = require("../config/db");

// dotenv.config();
// connectDB();

// const app = express();

// app.use(express.json());
// app.use(cors());

// // Routes
// const authRoutes = require("../routes/authRoutes");
// const expenseRoutes = require("../routes/expenseRoutes");
// const budgetRoutes = require("../routes/budgetRoutes");
// const reportRoutes = require("../routes/reportRoutes");
// //const adminRoutes = require("../routes/adminRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/expenses", expenseRoutes);
// app.use("/api/budgets", budgetRoutes);   // ✅ IMPORTANT
// app.use("/api/reports", reportRoutes);
// //app.use("/api/admin", adminRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("Smart Expense Tracker API Running");
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("../config/db");

dotenv.config();
connectDB();
const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });
    console.log("Email sent");
  } catch (error) {
    console.log("Email error:", error);
  }
};



const app = express();

app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("../routes/authRoutes");
const expenseRoutes = require("../routes/expenseRoutes");
const budgetRoutes = require("../routes/budgetRoutes");
const reportRoutes = require("../routes/reportRoutes");
// const adminRoutes = require("../routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
// app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Smart Expense Tracker API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
module.exports = { sendEmail };