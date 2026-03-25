require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3001"
    ],
    credentials: true
  })
);

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  Demo Payment App: MongoDB connected"))
  .catch((err) => console.error("❌  MongoDB connection error:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/payments", paymentRoutes);

app.get("/", (_req, res) => {
  res.json({
    service: "Demo Payment App Backend",
    port: process.env.PORT || 6000,
    status: "running",
    endpoints: {
      pay:     "POST  /api/payments/pay",
      history: "GET   /api/payments/history"
    }
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀  Demo Payment App backend running on http://localhost:${PORT}`);
  console.log(`🔗  Forwarding expenses to: ${process.env.EXPENSE_TRACKER_URL || "http://localhost:5000"}`);
});
