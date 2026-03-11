const Expense = require("../models/Expense");
const User = require("../models/User");
const Budget = require("../models/Budget");
const sendEmail = require("../config/email");

// Add Expense
exports.addExpense = async (req, res) => {
  try {

    const { category, amount, description, userId } = req.body;

    const expense = new Expense({
      userId,
      category,
      amount,
      description
    });

    const savedExpense = await expense.save();

    console.log("Expense added");

    // USER EXPENSES ONLY
    const expenses = await Expense.find({ userId });

    let totalExpenses = 0;

    expenses.forEach((exp) => {
      totalExpenses += Number(exp.amount);
    });

    // USER BUDGET ONLY
    const budgets = await Budget.find({ userId });

    let totalBudget = 0;

    budgets.forEach((b) => {
      totalBudget += Number(b.limit);
    });

    // current user
    const user = await User.findById(userId);

    // Budget exceed check
    if (totalExpenses > totalBudget) {

      if (user) {

        await sendEmail(
          user.email,
          "Budget Exceeded Alert",
          `Warning! Your total expenses ₹${totalExpenses} exceeded your budget ₹${totalBudget}.`
        );

        console.log("Budget exceeded mail sent");

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