const express = require("express");
const router = express.Router();
const { getTotalReport, getCategoryReport } = require("../controllers/reportController");
const Expense = require("../models/Expense");

// Total Expense Report
router.get("/total", async (req, res) => {
  try {
    const expenses = await Expense.find();

    let total = 0;

    expenses.forEach((expense) => {
      total += expense.amount;
    });

    res.json({
      message: "Total expense calculated",
      totalExpense: total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category Wise Report
router.get("/category", async (req, res) => {
  try {
    const expenses = await Expense.find();

    const report = {};

    expenses.forEach((expense) => {
      if (!report[expense.category]) {
        report[expense.category] = 0;
      }

      report[expense.category] += expense.amount;
    });

    res.json({
      message: "Category report generated",
      data: report
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;