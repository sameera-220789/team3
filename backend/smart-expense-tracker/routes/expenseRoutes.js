const express = require("express");
const router = express.Router();
const { addExpense, getExpenses, updateExpense, deleteExpense } = require("../controllers/expenseController");
const Expense = require("../models/Expense");

// ADD expense
router.post("/", addExpense);

// GET all expenses (supports month filter via controller)
router.get("/", getExpenses);

// UPDATE expense
router.put("/:id", updateExpense);

// DELETE expense
router.delete("/:id", deleteExpense);

module.exports = router;