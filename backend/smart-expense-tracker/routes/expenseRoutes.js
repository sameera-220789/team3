const express = require("express");
const router = express.Router();
const { addExpense } = require("../controllers/expenseController");
const Expense = require("../models/Expense");

// ADD expense (email logic controller lo untundi)
router.post("/", addExpense);

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    // Sort by descending date so recent transactions are fetched first
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE expense
router.put("/:id", async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description
      },
      { new: true }
    );

    res.json(updatedExpense);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating expense" });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json("Expense deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;