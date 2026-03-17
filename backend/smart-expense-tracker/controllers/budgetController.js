const Budget = require("../models/Budget");

// Get all budgets
exports.getBudgets = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const budgets = await Budget.find(filter);

    res.json(budgets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or Update Budget
exports.addBudget = async (req, res) => {
  try {
    const { category, limit, userId } = req.body;

    const limitNum = Number(limit);

    if (isNaN(limitNum) || limitNum < 0) {
      return res.status(400).json({ message: "Invalid limit amount" });
    }

    const allBudgets = await Budget.find({ userId });

    // Check against total budget if category is not 'total'
    if (category !== 'total') {
      const totalBudgetDoc = allBudgets.find(b => b.category === 'total');
      const totalBudgetAmount = totalBudgetDoc ? totalBudgetDoc.limit : 0;

      // Sum of other category budgets (excluding the one being updated)
      const otherCategoriesSum = allBudgets
        .filter(b => b.category !== 'total' && b.category !== category)
        .reduce((sum, b) => sum + b.limit, 0);

      // Total of allocated budgets cannot exceed the Overall Total Budget
      if (totalBudgetAmount === 0 || (otherCategoriesSum + limitNum > totalBudgetAmount)) {
        return res.status(400).json({ 
          message: `Cannot allocate ₹${limitNum}. It exceeds your remaining unallocated Overall Budget of ₹${totalBudgetAmount - otherCategoriesSum}.` 
        });
      }
    } else {
      // If updating 'total', ensure it is not set lower than what is already allocated to categories
      const allocatedSum = allBudgets
        .filter(b => b.category !== 'total')
        .reduce((sum, b) => sum + b.limit, 0);
        
      if (limitNum < allocatedSum) {
        return res.status(400).json({ 
          message: `Cannot set Overall Budget to ₹${limitNum}. You already have ₹${allocatedSum} allocated to categories. Please reduce category budgets first before lowering the Overall Budget.` 
        });
      }
    }

    // check existing budget
    let budget = await Budget.findOne({ category, userId });

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
        userId,
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

// Delete Budget
exports.deleteBudget = async (req, res) => {
  try {
    const { category } = req.params;
    const { userId } = req.query;

    if (!userId) {
       return res.status(400).json({ message: "User ID is required" });
    }

    if (category === 'total') {
       return res.status(400).json({ message: "Cannot delete overall total budget" });
    }

    const budget = await Budget.findOneAndDelete({ category, userId });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully", budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};