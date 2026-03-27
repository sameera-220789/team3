/**
 * Pure deterministic calculations. NO AI involved here.
 */
exports.analyzeFinancials = (data, intentData) => {
  const { expectedIncome = data.income, expenses = [], budgets = [], goals = [], entities = {} } = data;

  let totalExpenses = 0;
  const categoryBreakdown = {};

  // Aggregate expenses
  expenses.forEach((expense) => {
    totalExpenses += expense.amount;
    const cat = expense.category || "Uncategorized";
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = 0;
    }
    categoryBreakdown[cat] += expense.amount;
  });

  const remainingBalance = expectedIncome - totalExpenses;

  // Identify overspending categories based on limits
  const overspendingCategories = [];
  const activeBudgets = {};
  budgets.forEach(b => {
    activeBudgets[b.category] = b.limit;
    if (categoryBreakdown[b.category] && categoryBreakdown[b.category] > b.limit) {
      overspendingCategories.push({
        category: b.category,
        spent: categoryBreakdown[b.category],
        limit: b.limit,
        overBy: categoryBreakdown[b.category] - b.limit
      });
    }
  });

  // Calculate potential savings based on user goals
  const averageMonthlySavings = Math.max(0, remainingBalance);

  let goalFeasibility = null;
  if (intentData.intent === "goal_planning" && entities.goal) {
    // Attempt to match entity goal string to DB goals loosely or calculate custom adhoc
    const requestedGoal = goals.find(g => g.goalName.toLowerCase().includes(entities.goal.toLowerCase()));
    
    // If no exact match but an amount is found in entities (like "I want to buy a 500 laptop")
    let target = requestedGoal ? requestedGoal.targetAmount : (entities.amount || null);

    if (target) {
      if (remainingBalance >= target) {
        goalFeasibility = `Can afford this month by using the remaining balance of ₹${remainingBalance}. Target is ₹${target}.`;
      } else {
        const monthsNeeded = Math.ceil(target / (averageMonthlySavings || 1));
        const reducible = Object.keys(categoryBreakdown).sort((a,b) => categoryBreakdown[b] - categoryBreakdown[a])[0];
        goalFeasibility = `Cannot afford this month. Target: ₹${target}. Remaining balance: ₹${remainingBalance}. Would need ${monthsNeeded} months of current savings rate. Potential solution: reduce spending in highest category '${reducible}' which is currently ₹${categoryBreakdown[reducible] || 0}.`;
      }
    }
  }

  return {
    summary: {
      totalIncome: expectedIncome,
      totalExpenses,
      remainingBalance,
      savingsPotential: averageMonthlySavings,
    },
    categoryBreakdown,
    overspendingCategories,
    goalFeasibility,
    extractedEntities: entities
  };
};
