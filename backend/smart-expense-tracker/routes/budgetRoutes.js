const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

// GET budgets
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const budgets = await Budget.find(filter);
    res.json(budgets);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD or UPDATE budget
router.post("/", async (req, res) => {
  try {

    const { userId, category, limit } = req.body;

    // already category budget unda check
    let existingBudget = await Budget.findOne({ userId, category });

    if (existingBudget) {

      // update budget
      existingBudget.limit = limit;

      const updatedBudget = await existingBudget.save();

      res.json(updatedBudget);

    } else {

      // create new budget
      const newBudget = new Budget({
        userId,
        category,
        limit
      });

      const savedBudget = await newBudget.save();

      res.json(savedBudget);
    }

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;