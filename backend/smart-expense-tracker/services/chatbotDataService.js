const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");
const User = require("../models/User");

/**
 * Deterministically fetch required data based on intent
 */
exports.fetchFinancialData = async (userId, intentData) => {
  const { intent, entities } = intentData;

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  // Default time frame is this month unless past is requested
  let dateQuery = { $gte: thisMonthStart };
  // A robust check can analyze timeframe from entities

  // We gather everything for this month as a baseline for all calculations
  // unless user specified another timeframe. For simplicity, we'll grab this month's data.
  const expenses = await Expense.find({
    userId,
    type: "expense",
    date: dateQuery,
  });

  const budgets = await Budget.find({
    userId,
    // budget normally stores month string like "YYYY-MM", we just pull current user's active budgets or all
  });

  const goals = await Goal.find({
    userId,
    status: "ongoing"
  });

  return {
    income: user.totalIncome || 0,
    expenses,
    budgets,
    goals,
    entities // pass down for the analysis layer
  };
};
