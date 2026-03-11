const Expense = require("../models/Expense");
const User = require("../models/User");
const sendEmail = require("../config/email");

// TOTAL EXPENSE REPORT
exports.getTotalReport = async (req, res) => {
  try {

    const expenses = await Expense.find();

    let total = 0;

    expenses.forEach((expense) => {
      total += expense.amount;
    });

    // user find (mail send cheyyadaniki)
    const user = await User.findOne();

    if (user) {
      await sendEmail(
        user.email,
        "Total Expense Report",
        `Your total expenses are ₹${total}`
      );
      console.log("Total report email sent");
    }

    res.json({
      message: "Total expense calculated",
      totalExpense: total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// CATEGORY WISE REPORT
exports.getCategoryReport = async (req, res) => {
  try {

    const expenses = await Expense.find();

    const report = {};

    expenses.forEach((expense) => {

      if (!report[expense.category]) {
        report[expense.category] = 0;
      }

      report[expense.category] += expense.amount;

    });

    // user find
    const user = await User.findOne();

    if (user) {
      await sendEmail(
        user.email,
        "Category Expense Report",
        "Your category wise expense report has been generated."
      );
      console.log("Category report email sent");
    }

    res.json({
      message: "Category report generated",
      data: report
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};