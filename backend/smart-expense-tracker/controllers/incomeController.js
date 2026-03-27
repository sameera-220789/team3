const Expense = require("../models/Expense");
const User = require("../models/User");

// Add Income
exports.addIncome = async (req, res) => {
  try {
    const { userId, amount, category, date, notes } = req.body;
    const incomeAmount = Number(amount);

    if (isNaN(incomeAmount) || incomeAmount <= 0) {
      return res.status(400).json({ message: "Invalid income amount" });
    }

    const incomeDate = date ? new Date(date) : new Date();

    // 1. Fetch User Data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Save Income as Expense with type 'income'
    const income = new Expense({
      userId,
      type: 'income',
      category: category || 'others',
      amount: incomeAmount,
      description: notes || '',
      date: incomeDate,
      paymentMethod: "Bank Transfer", 
      isRecurring: false
    });

    const savedIncome = await income.save();

    // 3. Update User's totalIncome
    user.totalIncome = (user.totalIncome || 0) + incomeAmount;
    await user.save();

    // 4. Update Overall Budget for the current month
    const Budget = require("../models/Budget");
    const currentMonth = incomeDate.toISOString().slice(0, 7);
    const overallBudget = await Budget.findOne({ userId, month: currentMonth, category: 'total' });
    
    if (overallBudget) {
      overallBudget.totalBudget += incomeAmount;
      // Do NOT change overallBudget.limit — that is the user's originally set base budget
      overallBudget.remainingAmount += incomeAmount;
      await overallBudget.save();
    }

    res.json(savedIncome);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
