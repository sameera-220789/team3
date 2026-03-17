const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");

// GET budgets
router.get("/", budgetController.getBudgets);

// ADD or UPDATE budget
router.post("/", budgetController.addBudget);

// DELETE budget
router.delete("/:category", budgetController.deleteBudget);

module.exports = router;