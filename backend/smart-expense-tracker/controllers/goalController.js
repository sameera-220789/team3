const Goal = require('../models/Goal');
const User = require('../models/User');

exports.createGoal = async (req, res) => {
  try {
    const { userId, goalName, targetAmount, deadline } = req.body;
    const newGoal = new Goal({
      userId,
      goalName,
      targetAmount,
      deadline,
      savedAmount: 0,
      status: 'ongoing'
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const goals = await Goal.find({ userId });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addMoneyToGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source, month } = req.body; 

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const user = await User.findById(goal.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (source === 'savings') {
      if (user.totalSavings < amount) {
        return res.status(400).json({ message: "Insufficient total savings" });
      }
      user.totalSavings = Math.max(0, user.totalSavings - amount);
      await user.save();
    } else if (source === 'unallocated') {
      if (!month) return res.status(400).json({ message: "Month is required for unallocated funding" });
      
      const Budget = require('../models/Budget');
      const Expense = require('../models/Expense');
      
      const budgets = await Budget.find({ userId: user._id, month });
      const totalBudgetDoc = budgets.find(b => b.category === 'total');
      const totalLimit = totalBudgetDoc ? totalBudgetDoc.limit : 0;
      const totalAllocated = budgets.filter(b => b.category !== 'total').reduce((sum, b) => sum + b.limit, 0);
      const remainingUnallocated = totalLimit - totalAllocated;

      if (amount > remainingUnallocated) {
        return res.status(400).json({ message: "Insufficient unallocated budget" });
      }

      let goalsBudget = budgets.find(b => b.category === 'goals');
      if (goalsBudget) {
        goalsBudget.limit += amount;
        await goalsBudget.save();
      } else {
        goalsBudget = new Budget({ userId: user._id, month, category: 'goals', limit: amount });
        await goalsBudget.save();
      }

      const newExpense = new Expense({
         userId: user._id,
         amount: amount,
         category: 'goals',
         description: `Funded Goal: ${goal.goalName}`,
         date: new Date()
      });
      await newExpense.save();
    } else {
      return res.status(400).json({ message: "Invalid source. Must be 'savings' or 'unallocated'" });
    }

    goal.savedAmount += Number(amount);
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await Goal.findByIdAndDelete(id);
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
