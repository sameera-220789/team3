const Budget = require("../models/Budget");

// Get all budgets
exports.getBudgets = async (req, res) => {
  try {

    const budgets = await Budget.find();

    res.json(budgets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or Update Budget
exports.addBudget = async (req, res) => {
  try {

    const { category, limit } = req.body;

    // check existing budget
    let budget = await Budget.findOne({ category });

    if (budget) {

      // update existing
      budget.limit = limit;

      await budget.save();

      return res.json({
        message: "Budget updated",
        budget
      });

    } else {

      // create new
      const newBudget = new Budget({
        category,
        limit
      });

      await newBudget.save();

      return res.json({
        message: "Budget added",
        newBudget
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};