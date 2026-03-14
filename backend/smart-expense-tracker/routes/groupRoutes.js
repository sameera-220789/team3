const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// Create a new group
router.post("/create", groupController.createGroup);

// Get groups for a user
router.get("/", groupController.getGroups);

// Add a split expense
router.post("/expense/add", groupController.addSplitExpense);

// Get expenses for a specific group
router.get("/:id/expenses", groupController.getGroupExpenses);

// Get balance summary for a specific group
router.get("/:id/balance", groupController.getGroupBalance);

module.exports = router;
