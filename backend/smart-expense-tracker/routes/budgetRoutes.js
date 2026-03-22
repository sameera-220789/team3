const express = require("express");
const router = express.Router();
const { getBudgets, addBudget, deleteBudget, finalizeMonth, undoFinalizeMonth } = require("../controllers/budgetController");

// Get all budgets for a userId
router.get("/", getBudgets);

// Add a budget
router.post("/", addBudget);

// Delete a budget
router.delete("/:id", deleteBudget);

// Finalize a month (Carry forward or Save)
router.post("/finalize", finalizeMonth);

// Undo Finalization
router.post("/undo-finalize", undoFinalizeMonth);

module.exports = router;