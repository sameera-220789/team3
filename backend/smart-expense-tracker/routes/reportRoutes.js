const express = require("express");
const router = express.Router();
const {
  getTotalReport,
  getCategoryReport,
  getSpendingInsights,
  getMonthlyReport,
  downloadPDF,
  downloadCSV,
  getFinancialHealthScore
} = require("../controllers/reportController");
const Expense = require("../models/Expense");

// Financial Health Score
router.get("/financial-health-score", getFinancialHealthScore);

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