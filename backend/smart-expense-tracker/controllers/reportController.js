const Expense = require("../models/Expense");
const User = require("../models/User");
const Budget = require("../models/Budget");
const sendEmail = require("../config/email");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

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

// SMART SPENDING INSIGHTS
exports.getSpendingInsights = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const expenses = await Expense.find({ userId });
    
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    
    // Last Month
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    // Filter expenses
    const thisMonthExpenses = expenses.filter(e => new Date(e.date).toISOString().slice(0, 7) === currentMonth);
    const lastMonthExpenses = expenses.filter(e => new Date(e.date).toISOString().slice(0, 7) === lastMonth);

    // This Week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeekExpenses = expenses.filter(e => new Date(e.date) >= oneWeekAgo);
    const lastWeekExpenses = expenses.filter(e => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < oneWeekAgo);

    const insights = [];

    // 1. Overall Monthly Trend
    const thisMonthTotal = thisMonthExpenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);

    if (lastMonthTotal > 0) {
      const monthDiff = Math.min(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100, 100);
      if (monthDiff > 10) {
        insights.push({
          type: "warning",
          message: `Your total spending this month has increased by ${monthDiff.toFixed(0)}% compared to last month.`,
          suggestion: "Consider setting stricter category budgets."
        });
      } else if (monthDiff < -10) {
        insights.push({
          type: "success",
          message: `Great job! You've spent ${Math.abs(monthDiff).toFixed(0)}% less this month than last month.`,
          suggestion: "Move the surplus to your savings!"
        });
      }
    }

    if (thisMonthTotal > 0) {
      insights.push({
        type: "info",
        message: `You have spent ₹${thisMonthTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} so far this month.`,
        suggestion: "Keep tracking your expenses to stay within your budget."
      });
    }

    // 2. Category-wise Analysis (Monthly)
    const getCatTotals = (exps) => {
      const totals = {};
      exps.filter(e => e.type !== 'income').forEach(e => {
        const cat = (e.category || 'Other').toLowerCase(); // Consolidation
        totals[cat] = (totals[cat] || 0) + e.amount;
      });
      return totals;
    };

    const thisMonthCatTotals = getCatTotals(thisMonthExpenses);
    const lastMonthCatTotals = getCatTotals(lastMonthExpenses);

    Object.keys(thisMonthCatTotals).forEach(cat => {
      const current = thisMonthCatTotals[cat];
      const previous = lastMonthCatTotals[cat] || 0;

      if (previous > 0) {
        const diff = Math.min(((current - previous) / previous) * 100, 100);
        if (diff > 20) {
          insights.push({
            type: "info",
            message: `Your ${cat} expenses increased by ${diff.toFixed(0)}% compared to last month.`,
            suggestion: `Consider reducing your ${cat} spending.`
          });
        }
      }
    });

    const sortedCats = Object.entries(thisMonthCatTotals).sort((a,b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      const topCat = sortedCats[0];
      insights.push({
         type: "warning",
         message: `Your highest spending category this month is ${topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1)} (₹${topCat[1].toLocaleString('en-IN', { maximumFractionDigits: 2 })}).`,
         suggestion: `Consider reviewing your ${topCat[0]} expenses.`
      });
    }

    // 3. Weekly Trend & Category Spikes
    const thisWeekTotal = thisWeekExpenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const lastWeekTotal = lastWeekExpenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);

    // General weekly trend
    if (lastWeekTotal > 0) {
      const weekDiff = Math.min(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100, 100);
      if (weekDiff > 20) {
        insights.push({
          type: "warning",
          message: `Your total spending this week is ${weekDiff.toFixed(0)}% higher than last week.`,
          suggestion: "Try to limit non-essential purchases for the rest of the week."
        });
      }
    }

    // Specific category spikes (Weekly)
    const thisWeekCatTotals = getCatTotals(thisWeekExpenses);
    const lastWeekCatTotals = getCatTotals(lastWeekExpenses);

    const targetCategories = ['food', 'travel', 'shopping']; // Use lowercase
    targetCategories.forEach(cat => {
      const current = thisWeekCatTotals[cat] || 0;
      const previous = lastWeekCatTotals[cat] || 0;
      
      if (current > 0 && previous > 0) {
        const diff = Math.min(((current - previous) / previous) * 100, 100);
        if (diff > 25) {
          insights.push({
            type: "warning",
            message: `You spent ${diff.toFixed(0)}% more on ${cat} this week.`,
            suggestion: cat === 'food' ? "Consider reducing restaurant spending." : 
                        cat === 'travel' ? "Look for more economical transport options." :
                        "Think twice before your next purchase."
          });
        }
      }
    });

    const budgets = await Budget.find({ userId, month: currentMonth });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');
    if (totalBudgetDoc) {
      const limit = Number(totalBudgetDoc.limit || totalBudgetDoc.totalBudget);
      const remaining = limit - thisMonthTotal;
      if (remaining > 0) {
        insights.push({
           type: "success",
           message: `You have ₹${remaining.toLocaleString('en-IN', { maximumFractionDigits: 2 })} remaining in your overall budget.`,
           suggestion: "Great job! You are within your budget."
        });
      }
    }

    res.json(insights);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MONTHLY REPORT
exports.getMonthlyReport = async (req, res) => {
  try {
    const { userId, month } = req.query; // format: YYYY-MM
    if (!userId || !month) return res.status(400).json({ message: "userId and month are required" });

    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: -1 });

    const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = {};
    const dailySummary = {};

    expenses.forEach(e => {
        if (e.type === 'income') return;
        const cat = e.category || "Other";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;

        const day = new Date(e.date).getDate();
        dailySummary[day] = (dailySummary[day] || 0) + e.amount;
    });

    // Fetch budget for the month
    const budgets = await Budget.find({ userId, month });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');
    const totalBudgetLimit = totalBudgetDoc ? totalBudgetDoc.limit : 0;
    const remainingBudget = totalBudgetLimit - totalExpenses;

    res.json({
      month,
      totalExpenses,
      totalIncome,
      totalBudget: totalBudgetLimit,
      remainingBudget,
      categoryBreakdown,
      dailySummary,
      expenses
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD PDF REPORT
exports.downloadPDF = async (req, res) => {
  try {
    const { userId, month } = req.query;
    if (!userId || !month) return res.status(400).send("userId and month are required");

    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const doc = new PDFDocument();
    let filename = `Expense_Report_${month}.pdf`;
    
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.fontSize(20).text(`Expense Report - ${month}`, { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(16).text("Category-wise Breakdown:");
    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || "Other";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    Object.entries(categoryBreakdown).forEach(([cat, amt]) => {
        doc.fontSize(12).text(`${cat}: ₹${amt.toFixed(2)}`);
    });
    doc.moveDown();

    doc.fontSize(16).text("Expenses List:");
    doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Date | Description | Category | Amount", { underline: true });
    doc.moveDown(0.5);

    expenses.forEach(e => {
        const dateStr = new Date(e.date).toLocaleDateString();
        doc.fontSize(10).text(`${dateStr} | ${e.description || '-'} | ${e.category} | ₹${e.amount.toFixed(2)}`);
    });

    doc.pipe(res);
    doc.end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD CSV REPORT
exports.downloadCSV = async (req, res) => {
  try {
    const { userId, month } = req.query;
    if (!userId || !month) return res.status(400).send("userId and month are required");

    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const expenses = await Expense.find({
        userId,
        date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    const fields = [
        { label: 'Date', value: (row) => new Date(row.date).toISOString().split('T')[0] },
        { label: 'Type', value: (row) => row.type || 'expense' },
        { label: 'Description', value: 'description' },
        { label: 'Category', value: 'category' },
        { label: 'Amount', value: 'amount' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    res.header("Content-Type", "text/csv");
    res.attachment(`Expense_Report_${month}.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FINANCIAL HEALTH SCORE
exports.getFinancialHealthScore = async (req, res) => {
  try {
    const { userId, month } = req.query; // format: YYYY-MM
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const startDate = new Date(`${targetMonth}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Fetch budgets and expenses for the month
    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId, month: targetMonth }),
      Expense.find({ userId, date: { $gte: startDate, $lt: endDate } })
    ]);

    const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalBudgetDoc = budgets.find(b => b.category === 'total');
    const totalBudgetLimit = totalBudgetDoc ? totalBudgetDoc.limit : 0;

    // 1. Budget Usage (40 points)
    let budgetUsageScore = 0;
    if (totalBudgetLimit > 0) {
      if (totalExpenses <= totalBudgetLimit) {
        budgetUsageScore = 40;
      } else {
        const overspentRatio = (totalExpenses - totalBudgetLimit) / totalBudgetLimit;
        budgetUsageScore = Math.max(0, 40 - (overspentRatio * 40));
      }
    } else {
        budgetUsageScore = 0;
    }

    // 2. Savings Score (30 points)
    let savingsScore = 0;
    const monthlySavings = totalIncome - totalExpenses;
    if (monthlySavings > 0) {
      const savingsRatio = totalIncome > 0 ? monthlySavings / totalIncome : 1; 
      savingsScore = Math.min(30, (savingsRatio / 0.2) * 30);
    } else if (totalIncome === 0 && totalExpenses === 0) {
      savingsScore = 15; 
    } else {
      savingsScore = 0;
    }

    // 3. Overspending Frequency (30 points)
    const overspentCategories = budgets.filter(b => b.category !== 'total' && b.spentAmount > b.limit);
    const overspentCount = overspentCategories.length;
    const overspendingScore = Math.max(0, 30 - (overspentCount * 10));

    const totalScore = Math.round(budgetUsageScore + savingsScore + overspendingScore);

    let insight = "";
    if (totalScore >= 80) {
      insight = "Excellent! You are managing your finances perfectly.";
    } else if (totalScore >= 60) {
      insight = "Good job! You managed your budget well this month.";
    } else if (totalScore >= 40) {
        insight = "You're on track, but there's room for improvement in your spending habits.";
    } else {
      insight = "You exceeded your budget multiple times. Try reducing unnecessary expenses.";
    }

    res.json({
      score: totalScore,
      details: {
        budgetUsage: Math.round(budgetUsageScore),
        savingsScore: Math.round(savingsScore),
        overspendingScore: Math.round(overspendingScore)
      },
      insight
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};