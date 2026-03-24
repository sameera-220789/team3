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
dotenv.config(); // Load variables first!

const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const connectDB = require("../config/db");

// Load Passport Config
require("../config/passport");

connectDB();

const nodemailer = require("nodemailer");
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

// Global API request counter for admin system health
global.apiRequestCount = 0;

app.use(express.json());
app.use(cors());

// Count every API request
app.use((req, res, next) => {
  global.apiRequestCount++;
  next();
});

// Session Middleware (needed for passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smart_expense_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require("../routes/authRoutes");
const oauthRoutes = require("../routes/oauthRoutes"); // New OAuth routes
const expenseRoutes = require("../routes/expenseRoutes");
const budgetRoutes = require("../routes/budgetRoutes");
const reportRoutes = require("../routes/reportRoutes");
const alertRoutes = require("../routes/alertRoutes");
const groupRoutes = require("../routes/groupRoutes");
const receiptRoutes = require("../routes/receiptRoutes");
const goalRoutes = require("../routes/goalRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const adminRoutes = require("../routes/adminRoutes");
const recurringRoutes = require("../routes/recurringRoutes");
const { checkReminders } = require("../services/reminderService");

app.use("/api/auth", authRoutes);
app.use("/auth", oauthRoutes); 
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/recurring", recurringRoutes);

// Recurring Bill Reminders Service (check every 15 mins)
setInterval(() => {
  console.log("Checking for bill reminders...");
  checkReminders();
}, 15 * 60 * 1000);
// Also run once on startup
checkReminders();

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Smart Expense Tracker API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { sendEmail };