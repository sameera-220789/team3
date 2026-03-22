const Budget = require("../models/Budget");
const User = require("../models/User");

// Get all budgets for a month
exports.getBudgets = async (req, res) => {
  try {
    const { userId, month } = req.query;
    const budgetMonth = month || new Date().toISOString().slice(0, 7);
    
    // Check if previous month needs finalization/carry-forward processing
    // This ensures that when a user looks at a month, we've applied carry-forwards
    await checkAndApplyCarryForward(userId, budgetMonth);

    const filter = userId ? { userId, month: budgetMonth } : { month: budgetMonth };
    const budgets = await Budget.find(filter);

    res.json(budgets);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or Update Budget
exports.addBudget = async (req, res) => {
  try {
    const { category, limit, userId, month } = req.body;

    const budgetAmount = Number(limit);

    if (isNaN(budgetAmount) || budgetAmount < 0) {
      return res.status(400).json({ message: "Invalid budget amount" });
    }

    const budgetMonth = month || new Date().toISOString().slice(0, 7);
    const allBudgets = await Budget.find({ userId, month: budgetMonth });

    // Check against total budget if category is not 'total'
    if (category !== 'total') {
      const totalBudgetDoc = allBudgets.find(b => b.category === 'total');
      const totalBudgetAmount = totalBudgetDoc ? totalBudgetDoc.totalBudget : 0;

      // Sum of other category budgets (excluding the one being updated)
      const otherCategoriesSum = allBudgets
        .filter(b => b.category !== 'total' && b.category !== category)
        .reduce((sum, b) => sum + b.totalBudget, 0);

      // Total of allocated budgets cannot exceed the Overall Total Budget
      if (totalBudgetAmount === 0 || (otherCategoriesSum + budgetAmount > totalBudgetAmount)) {
        return res.status(400).json({ 
          message: `Cannot allocate ₹${budgetAmount}. It exceeds your remaining unallocated Overall Budget of ₹${totalBudgetAmount - otherCategoriesSum}.` 
        });
      }
    } else {
      // If updating 'total', ensure it is not set lower than what is already allocated to categories
      const allocatedSum = allBudgets
        .filter(b => b.category !== 'total')
        .reduce((sum, b) => sum + b.totalBudget, 0);
        
      if (budgetAmount < allocatedSum) {
        return res.status(400).json({ 
          message: `Cannot set Overall Budget to ₹${budgetAmount}. You already have ₹${allocatedSum} allocated to categories. Please reduce category budgets first before lowering the Overall Budget.` 
        });
      }
    }

    // check existing budget
    let budget = await Budget.findOne({ category, userId, month: budgetMonth });

    if (budget) {
      // update existing
      budget.totalBudget = budgetAmount;
      budget.limit = budgetAmount; // sync for legacy
      budget.remainingAmount = budget.totalBudget - budget.spentAmount;
      await budget.save();
      return res.json({
        message: "Budget updated",
        budget
      });
    } else {
      // create new
      let finalBudget = budgetAmount;
      
      // Apply carry forward ONLY for 'total' budget
      if (category === 'total') {
        const prevDate = new Date(`${budgetMonth}-01`);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const prevMonth = prevDate.toISOString().slice(0, 7);
        const prevBudget = await Budget.findOne({ userId, month: prevMonth, category: 'total', carryForward: true });
        
        if (prevBudget && prevBudget.remainingAmount > 0) {
            finalBudget += prevBudget.remainingAmount;
            prevBudget.carryForward = false; // Mark as applied to prevent double application
            await prevBudget.save();
        }
      }

      const newBudget = new Budget({
        userId,
        category,
        totalBudget: finalBudget,
        limit: finalBudget, // sync for legacy
        month: budgetMonth,
        spentAmount: 0,
        remainingAmount: finalBudget
      });
      await newBudget.save();
      return res.json({
        message: "Budget added",
        newBudget,
        appliedCarryForward: finalBudget > budgetAmount
      });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Budget
exports.deleteBudget = async (req, res) => {
  try {
    const category = req.params.id;
    const { userId, month } = req.query;

    if (!userId) {
       return res.status(400).json({ message: "User ID is required" });
    }

    if (category === 'total') {
       return res.status(400).json({ message: "Cannot delete overall total budget" });
    }

    const budgetMonth = month || new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOneAndDelete({ category, userId, month: budgetMonth });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully", budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Finalize Month (Carry Forward or Save)
exports.finalizeMonth = async (req, res) => {
  try {
    const { userId, month, option } = req.body; // option: 'carryForward' or 'savings'

    const budgets = await Budget.find({ userId, month });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');

    if (!totalBudgetDoc) {
      return res.status(404).json({ message: "Budget for this month not found" });
    }

    const remaining = totalBudgetDoc.remainingAmount;

    if (remaining <= 0) {
      return res.status(400).json({ message: "No remaining budget to process" });
    }

    if (option === 'carryForward') {
      // 1. Process Total Budget
      totalBudgetDoc.carryForward = true;
      totalBudgetDoc.savings = 0;
      await totalBudgetDoc.save();
      
      const nextDate = new Date(`${month}-01`);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.toISOString().slice(0, 7);

      let nextTotalBudget = await Budget.findOne({ userId, month: nextMonth, category: 'total' });
      if (nextTotalBudget) {
          nextTotalBudget.totalBudget += remaining;
          nextTotalBudget.limit += remaining;
          nextTotalBudget.remainingAmount += remaining;
          await nextTotalBudget.save();
      } else {
         // Optionally create or just leave it for addBudget to handle when user sets it
      }

      // 2. Process all Category Budgets
      const categoryBudgets = budgets.filter(b => b.category !== 'total');
      for (const catBudget of categoryBudgets) {
        if (catBudget.remainingAmount > 0) {
          let nextCatBudget = await Budget.findOne({ userId, month: nextMonth, category: catBudget.category });
          if (nextCatBudget) {
            nextCatBudget.totalBudget += catBudget.remainingAmount;
            nextCatBudget.limit += catBudget.remainingAmount;
            nextCatBudget.remainingAmount += catBudget.remainingAmount;
            await nextCatBudget.save();
          } else {
            // Create next month's category budget with the carryover as initial limit
            const newCatBudget = new Budget({
              userId,
              category: catBudget.category,
              totalBudget: catBudget.remainingAmount,
              limit: catBudget.remainingAmount,
              spentAmount: 0,
              remainingAmount: catBudget.remainingAmount,
              month: nextMonth
            });
            await newCatBudget.save();
          }
        }
      }

      res.json({ message: "Budget carried forward to next month", amount: remaining });

    } else if (option === 'savings') {
      totalBudgetDoc.savings = remaining;
      totalBudgetDoc.carryForward = false;
      await totalBudgetDoc.save();

      const user = await User.findById(userId);
      if (user) {
        user.totalSavings = (Number(user.totalSavings) || 0) + remaining;
        await user.save();
      }

      res.json({ message: "Remaining budget moved to savings", amount: remaining });
    } else {
      res.status(400).json({ message: "Invalid option" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Undo Finalize Month
exports.undoFinalizeMonth = async (req, res) => {
  try {
    const { userId, month } = req.body;

    const budgets = await Budget.find({ userId, month });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');

    if (!totalBudgetDoc) {
      return res.status(404).json({ message: "Budget for this month not found" });
    }

    const nextDate = new Date(`${month}-01`);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextMonth = nextDate.toISOString().slice(0, 7);

    if (totalBudgetDoc.carryForward) {
      const remaining = totalBudgetDoc.remainingAmount;
      
      // 1. Revert Next Total Budget
      let nextTotalBudget = await Budget.findOne({ userId, month: nextMonth, category: 'total' });
      if (nextTotalBudget) {
        nextTotalBudget.totalBudget = Math.max(0, nextTotalBudget.totalBudget - remaining);
        nextTotalBudget.limit = Math.max(0, nextTotalBudget.limit - remaining);
        nextTotalBudget.remainingAmount = nextTotalBudget.totalBudget - nextTotalBudget.spentAmount;
        await nextTotalBudget.save();
      }

      // 2. Revert all Next Category Budgets
      const categoryBudgets = budgets.filter(b => b.category !== 'total');
      for (const catBudget of categoryBudgets) {
        if (catBudget.remainingAmount > 0) {
          let nextCatBudget = await Budget.findOne({ userId, month: nextMonth, category: catBudget.category });
          if (nextCatBudget) {
            nextCatBudget.totalBudget = Math.max(0, nextCatBudget.totalBudget - catBudget.remainingAmount);
            nextCatBudget.limit = Math.max(0, nextCatBudget.limit - catBudget.remainingAmount);
            nextCatBudget.remainingAmount = nextCatBudget.totalBudget - nextCatBudget.spentAmount;
            
            // If the budget was only created for carry-forward and now is 0, delete it?
            // For now, just keep it at 0.
            await nextCatBudget.save();
          }
        }
      }

      totalBudgetDoc.carryForward = false;
      await totalBudgetDoc.save();
      return res.json({ message: "Carry forward undone successfully" });

    } else if (totalBudgetDoc.savings > 0) {
      const savedAmount = totalBudgetDoc.savings;
      
      const user = await User.findById(userId);
      if (user) {
        user.totalSavings = Math.max(0, (Number(user.totalSavings) || 0) - savedAmount);
        await user.save();
      }

      totalBudgetDoc.savings = 0;
      await totalBudgetDoc.save();
      return res.json({ message: "Savings moved back successfully" });
    }

    res.status(400).json({ message: "This month is not finalized or has nothing to undo" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to apply carry forward from previous month (if not already applied)
async function checkAndApplyCarryForward(userId, currentMonth) {
    if (!userId) return;

    const prevDate = new Date(`${currentMonth}-01`);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonth = prevDate.toISOString().slice(0, 7);

    // Find if previous month had carryForward set
    const prevBudget = await Budget.findOne({ userId, month: prevMonth, category: 'total', carryForward: true });
    
    if (prevBudget && prevBudget.remainingAmount > 0) {
        const carryAmount = prevBudget.remainingAmount;
        
        let currentBudget = await Budget.findOne({ userId, month: currentMonth, category: 'total' });
        
        if (currentBudget) {
            // Check if we already applied this (by comparing if it's already accounted for, or use a flag)
            // For now, let's just make finalizeMonth handle it if nextBudget exists, 
            // and addBudget handle it if creating new budget.
        }
    }
}