const express = require("express");
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense, autoAddExpense, autoDetectSms } = require("../controllers/expenseController");
const { verifyToken } = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");

// ADD expense manually
router.post("/", addExpense);

// ADD expense automatically from Payment App
router.post("/auto-add", verifyToken, autoAddExpense);

// AUTO DETECT from SMS
router.post("/auto-detect-sms", autoDetectSms);

// GET all expenses (supports month filter via controller)
router.get("/", getExpenses);

// UPDATE expense
router.put("/:id", updateExpense);

// DELETE expense
router.delete("/:id", deleteExpense);

module.exports = router;