const express = require("express");
const router = express.Router();
const {
  getTotalReport,
  getCategoryReport,
  getSpendingInsights,
  getMonthlyReport,
  downloadPDF,
  downloadCSV
} = require("../controllers/reportController");
const Expense = require("../models/Expense");

// Total Expense Report
router.get("/total", getTotalReport);

// Category Wise Report
router.get("/category", getCategoryReport);

// Smart Spending Insights
router.get("/spending-insights", getSpendingInsights);

// Monthly Detailed Report
router.get("/monthly", getMonthlyReport);

// Download Reports
router.get("/download/pdf", downloadPDF);
router.get("/download/csv", downloadCSV);

module.exports = router;