const Expense = require("../models/Expense");
const User = require("../models/User");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const sendEmail = require("../config/email");

// Add Expense
exports.addExpense = async (req, res) => {
  try {
    const { category, amount, description, userId, date, paymentMethod, isRecurring } = req.body;
    const expenseAmount = Number(amount);

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ message: "Invalid expense amount" });
    }

    // 1. Fetch User Data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch all expenses and budgets for calculations
    const expenses = await Expense.find({ userId });
    const budgets = await Budget.find({ userId });

    const totalSpentBefore = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
    const remainingBudget = totalBudget - totalSpentBefore;

    // 3. Category-wise Budget Protection
    const categoryBudget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
    if (categoryBudget) {
      const categorySpentBefore = expenses
        .filter(exp => exp.category.toLowerCase() === category.toLowerCase())
        .reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      if (categorySpentBefore + expenseAmount > categoryBudget.limit) {
        return res.status(400).json({ message: "Category budget limit exceeded." });
      }
    }

    // 4. Prevent Budget From Going Negative / Prevent Addition After Limit
    if (totalBudget > 0 && totalSpentBefore + expenseAmount > totalBudget) {
      return res.status(400).json({ message: "Cannot add expense. Budget limit exceeded." });
    }

    // 5. Save Expense
    const expense = new Expense({
      userId,
      category,
      amount: expenseAmount,
      description,
      date,
      paymentMethod,
      isRecurring
    });

    const savedExpense = await expense.save();

    // 6. Milestone Check (Alerts)
    const totalSpentAfter = totalSpentBefore + expenseAmount;
    const usagePercent = totalBudget > 0 ? (totalSpentAfter / totalBudget) * 100 : 0;

    let alertMsg = "";
    let threshold = 0;

    if (usagePercent >= 100) {
      alertMsg = "Your budget limit has been reached.";
      threshold = 100;
    } else if (usagePercent >= 90) {
      alertMsg = "Warning: You have used 90% of your budget.";
      threshold = 90;
    } else if (usagePercent >= 50) {
      alertMsg = "You have used 50% of your budget.";
      threshold = 50;
    }

    if (alertMsg) {
      // Check if we already sent this specific milestone alert recently (to avoid spam)
      // For now, just send it and store it or implement a more complex check
      const newAlert = new Alert({
        userId,
        type: "milestone",
        threshold,
        message: alertMsg,
        category: category
      });
      await newAlert.save();

      // Send Email
      if (user.email) {
        await sendEmail(
          user.email,
          "Budget Alert",
          alertMsg + ` Total Spent: ₹${totalSpentAfter} / ₹${totalBudget}`
        );
      }
    }

    res.json(savedExpense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// Get Expenses (USER WISE)
exports.getExpenses = async (req, res) => {
  try {

    const { userId } = req.query;

    const expenses = await Expense.find({ userId });

    res.json(expenses);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Expense
exports.updateExpense = async (req, res) => {
  try {

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {

    await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: "Expense deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};