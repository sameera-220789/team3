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

    const expenseDate = date ? new Date(date) : new Date();
    const expenseMonth = expenseDate.toISOString().slice(0, 7); // YYYY-MM

    // 1. Fetch User Data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch budgets for the specific month
    const budgets = await Budget.find({ userId, month: expenseMonth });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');
    
    if (!totalBudgetDoc) {
      return res.status(400).json({ message: `No budget set for ${expenseMonth}. Please set a budget first.` });
    }

    const totalBudget = Number(totalBudgetDoc.totalBudget);
    const totalSpentBefore = Number(totalBudgetDoc.spentAmount);

    // 3. Category-wise Budget Protection
    const categoryBudget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
    if (categoryBudget) {
      if (categoryBudget.spentAmount + expenseAmount > categoryBudget.totalBudget) {
        return res.status(400).json({ message: `Category budget limit exceeded for ${category}.` });
      }
    }

    // 4. Prevent Overall Budget From Going Negative
    if (totalSpentBefore + expenseAmount > totalBudget) {
      return res.status(400).json({ message: "Overall Budget limit exceeded for this month." });
    }

    // 5. Save Expense
    const expense = new Expense({
      userId,
      category,
      amount: expenseAmount,
      description,
      date: expenseDate,
      paymentMethod,
      isRecurring
    });

    const savedExpense = await expense.save();

    // 6. Update Budget Stats
    // Update category budget if it exists
    if (categoryBudget) {
      const catTotal = Number(categoryBudget.totalBudget || categoryBudget.limit || 0);
      categoryBudget.spentAmount = (Number(categoryBudget.spentAmount) || 0) + expenseAmount;
      categoryBudget.totalBudget = catTotal; // Ensure field is populated
      categoryBudget.remainingAmount = catTotal - categoryBudget.spentAmount;
      await categoryBudget.save();
    }

    // Update total budget
    const overallTotal = Number(totalBudgetDoc.totalBudget || totalBudgetDoc.limit || 0);
    totalBudgetDoc.spentAmount = (Number(totalBudgetDoc.spentAmount) || 0) + expenseAmount;
    totalBudgetDoc.totalBudget = overallTotal; // Ensure field is populated
    totalBudgetDoc.remainingAmount = overallTotal - totalBudgetDoc.spentAmount;
    await totalBudgetDoc.save();

    // 7. Milestone Check (Alerts)
    const totalSpentAfter = totalBudgetDoc.spentAmount;
    const usagePercent = totalBudget > 0 ? (totalSpentAfter / totalBudget) * 100 : 0;

    let alertMsg = "";
    let threshold = 0;

    if (usagePercent >= 100) {
      alertMsg = `Your overall budget limit for ${expenseMonth} has been reached.`;
      threshold = 100;
    } else if (usagePercent >= 90) {
      alertMsg = `Warning: You have used 90% of your overall budget for ${expenseMonth}.`;
      threshold = 90;
    } else if (usagePercent >= 50 && usagePercent < 90) {
      alertMsg = `You have used 50% of your overall budget for ${expenseMonth}.`;
      threshold = 50;
    }

    if (alertMsg) {
      const existingAlert = await Alert.findOne({ userId, type: "milestone", threshold, month: expenseMonth });
      
      if (!existingAlert) {
        const newAlert = new Alert({
          userId,
          type: "milestone",
          threshold,
          message: alertMsg,
          category: 'total',
          month: expenseMonth
        });
        await newAlert.save();

        if (user.email) {
          await sendEmail(
            user.email,
            "Budget Alert",
            alertMsg + ` Total Spent: ₹${totalSpentAfter} / ₹${totalBudget}`
          );
        }
      }
    }

    res.json(savedExpense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


// Get Expenses (USER WISE & MONTH WISE)
exports.getExpenses = async (req, res) => {
  try {

    const { userId, month, range } = req.query;
    let filter = userId ? { userId } : {};
    
    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    } else if (range) {
      const days = parseInt(range, 10);
      if (!isNaN(days)) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        filter.date = { $gte: startDate };
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    res.json(expenses);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const oldExpense = await Expense.findById(expenseId);
    if (!oldExpense) return res.status(404).json({ message: "Expense not found" });

    const { amount, category, date } = req.body;
    const diff = amount ? Number(amount) - oldExpense.amount : 0;
    
    const updated = await Expense.findByIdAndUpdate(
      expenseId,
      req.body,
      { new: true }
    );

    // Update Budgets if amount or category changed
    if (diff !== 0 || (category && category !== oldExpense.category)) {
      const expenseDate = updated.date || oldExpense.date;
      const expenseMonth = new Date(expenseDate).toISOString().slice(0, 7);
      
      const budgets = await Budget.find({ userId: oldExpense.userId, month: expenseMonth });
      
      // Update Total Budget
      const totalBudgetDoc = budgets.find(b => b.category === 'total');
      if (totalBudgetDoc) {
        const overallTotal = Number(totalBudgetDoc.totalBudget || totalBudgetDoc.limit || 0);
        totalBudgetDoc.spentAmount = (Number(totalBudgetDoc.spentAmount) || 0) + diff;
        totalBudgetDoc.totalBudget = overallTotal;
        totalBudgetDoc.remainingAmount = overallTotal - totalBudgetDoc.spentAmount;
        await totalBudgetDoc.save();
      }

      // If category changed, need to handle both old and new category budgets
      if (category && category !== oldExpense.category) {
        const oldCatBudget = budgets.find(b => b.category.toLowerCase() === oldExpense.category.toLowerCase());
        if (oldCatBudget) {
          const oldCatTotal = Number(oldCatBudget.totalBudget || oldCatBudget.limit || 0);
          oldCatBudget.spentAmount = Math.max(0, (Number(oldCatBudget.spentAmount) || 0) - oldExpense.amount);
          oldCatBudget.totalBudget = oldCatTotal;
          oldCatBudget.remainingAmount = oldCatTotal - oldCatBudget.spentAmount;
          await oldCatBudget.save();
        }
        const newCatBudget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
        if (newCatBudget) {
          const newCatTotal = Number(newCatBudget.totalBudget || newCatBudget.limit || 0);
          newCatBudget.spentAmount = (Number(newCatBudget.spentAmount) || 0) + updated.amount;
          newCatBudget.totalBudget = newCatTotal;
          newCatBudget.remainingAmount = newCatTotal - newCatBudget.spentAmount;
          await newCatBudget.save();
        }
      } else if (diff !== 0) {
        const catBudget = budgets.find(b => b.category.toLowerCase() === (category || oldExpense.category).toLowerCase());
        if (catBudget) {
          const catTotal = Number(catBudget.totalBudget || catBudget.limit || 0);
          catBudget.spentAmount = (Number(catBudget.spentAmount) || 0) + diff;
          catBudget.totalBudget = catTotal;
          catBudget.remainingAmount = catTotal - catBudget.spentAmount;
          await catBudget.save();
        }
      }
    }

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const oldExpense = await Expense.findById(expenseId);
    if (!oldExpense) return res.status(404).json({ message: "Expense not found" });

    const { amount, category, date } = oldExpense;
    const month = new Date(date).toISOString().slice(0, 7);

    // Update categories budget
    const categoryBudget = await Budget.findOne({ userId: oldExpense.userId, category, month });
    if (categoryBudget) {
      const catTotal = Number(categoryBudget.totalBudget || categoryBudget.limit || 0);
      categoryBudget.spentAmount = Math.max(0, (Number(categoryBudget.spentAmount) || 0) - amount);
      categoryBudget.totalBudget = catTotal;
      categoryBudget.remainingAmount = catTotal - categoryBudget.spentAmount;
      await categoryBudget.save();
    }

    // Update total budget
    const totalBudgetDoc = await Budget.findOne({ userId: oldExpense.userId, category: 'total', month });
    if (totalBudgetDoc) {
      const overallTotal = Number(totalBudgetDoc.totalBudget || totalBudgetDoc.limit || 0);
      totalBudgetDoc.spentAmount = Math.max(0, (Number(totalBudgetDoc.spentAmount) || 0) - amount);
      totalBudgetDoc.totalBudget = overallTotal;
      totalBudgetDoc.remainingAmount = overallTotal - totalBudgetDoc.spentAmount;
      await totalBudgetDoc.save();
    }

    await Expense.findByIdAndDelete(expenseId);
    res.json({ message: "Expense deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};