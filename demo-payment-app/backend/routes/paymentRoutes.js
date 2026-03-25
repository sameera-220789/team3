const express = require("express");
const router = express.Router();
const { processPayment, getHistory } = require("../controllers/paymentController");

// POST  /api/payments/pay      → process a new payment
router.post("/pay", processPayment);

// GET   /api/payments/history  → fetch user's transaction history
router.get("/history", getHistory);

module.exports = router;
