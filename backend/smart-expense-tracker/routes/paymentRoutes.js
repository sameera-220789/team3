const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/paymentController");

// POST create payment transaction
router.post("/pay", processPayment);

module.exports = router;
