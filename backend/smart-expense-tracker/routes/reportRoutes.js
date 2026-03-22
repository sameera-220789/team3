const express = require("express");
const router = express.Router();
const { getTotalReport, getCategoryReport, getSpendingInsights } = require("../controllers/reportController");
const Expense = require("../models/Expense");

// Total Expense Report
router.get("/total", getTotalReport);

// Category Wise Report
router.get("/category", getCategoryReport);

// Smart Spending Insights
router.get("/spending-insights", getSpendingInsights);

module.exports = router;