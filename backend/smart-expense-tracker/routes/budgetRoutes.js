const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");

// GET budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD or UPDATE budget
router.post("/", async (req, res) => {
  try {

    const { category, limit } = req.body;

    // already category budget unda check
    let existingBudget = await Budget.findOne({ category });

    if (existingBudget) {

      // update budget
      existingBudget.limit = limit;

      const updatedBudget = await existingBudget.save();

      res.json(updatedBudget);

    } else {

      // create new budget
      const newBudget = new Budget({
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