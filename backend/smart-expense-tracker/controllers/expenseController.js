const Expense = require("../models/Expense");
const User = require("../models/User");
const Budget = require("../models/Budget");
const Alert = require("../models/Alert");
const sendEmail = require("../config/email");
const crypto = require("crypto");

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

      // Alert Cleanup: Remove milestone alerts that are > current usage %
      const usagePercent = overallTotal > 0 ? (totalBudgetDoc.spentAmount / overallTotal) * 100 : 0;
      await Alert.deleteMany({
        userId: oldExpense.userId,
        type: 'milestone',
        month,
        threshold: { $gt: usagePercent }
      });
    }

    await Expense.findByIdAndDelete(expenseId);
    res.json({ message: "Expense deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto Add Expense (from Demo Payment App)
exports.autoAddExpense = async (req, res) => {
  try {
    const { amount, description, source } = req.body;
    let { category, userId } = req.body;

    // Use userId from body OR from authenticated token (req.user)
    if (!userId && req.user) {
      userId = req.user.userId;
    }
    
    const expenseAmount = Number(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ message: "Invalid expense amount" });
    }

    // Smart Features: Auto Categorization
    if (!category) {
      const categoryKeywords = {
        Food: ["swiggy", "zomato", "mcdonalds", "kfc", "dominos", "food", "restaurant"],
        Travel: ["uber", "ola", "rapido", "irctc", "makemytrip", "flight", "train"],
        Shopping: ["amazon", "flipkart", "myntra", "meesho", "shopping", "store"],
        Bills: ["electricity", "recharge", "jio", "airtel", "water", "bill"]
      };
      
      category = "Other"; // Default
      const descLower = (description || "").toLowerCase();
      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => descLower.includes(kw))) {
          category = cat;
          break;
        }
      }
    }

    // Smart Features: Duplicate Prevention (idempotent on payment content)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Stable hash so retries / duplicate POSTs don't create multiple expense docs.
    const messageHash = crypto
      .createHash("sha256")
      .update(`${String(userId)}|${expenseAmount}|${description}|${source || "demo-payment-app"}`)
      .digest("hex");

    const duplicate = await Expense.findOne({
      userId,
      $or: [
        { messageHash },
        {
          amount: expenseAmount,
          description,
          date: { $gte: fiveMinsAgo },
        },
      ],
    });
    
    if (duplicate) {
      return res.status(400).json({ message: "Duplicate transaction prevented" });
    }

    const expenseDate = new Date();
    const expenseMonth = expenseDate.toISOString().slice(0, 7); // YYYY-MM

    // 1. Fetch User Data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch budgets
    const budgets = await Budget.find({ userId, month: expenseMonth });
    const totalBudgetDoc = budgets.find(b => b.category === 'total');
    
    if (!totalBudgetDoc) {
      // For auto-add, if no budget is set, we still add the expense, but we skip budget logic
      // to ensure the payment flow doesn't break. Or we can reject. Assuming allow for now.
    } else {
      const totalBudget = Number(totalBudgetDoc.totalBudget);
      const totalSpentBefore = Number(totalBudgetDoc.spentAmount);

      // 3. Category-wise Budget Protection (No longer blocking for auto-payments)
      const categoryBudget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());

      // 4. Prevent Overall Budget From Going Negative (No longer blocking for auto-payments)

      // 4b. Update Wallet Balance (totalSavings)
      if (user.totalSavings == null) user.totalSavings = 0;
      if (expenseAmount > user.totalSavings && user.totalSavings >= 0) {
        return res.status(400).json({ message: "Insufficient wallet balance." });
      }
      user.totalSavings -= expenseAmount;
      await user.save();

      // Update Budget Stats
      if (categoryBudget) {
        const catTotal = Number(categoryBudget.totalBudget || categoryBudget.limit || 0);
        categoryBudget.spentAmount = (Number(categoryBudget.spentAmount) || 0) + expenseAmount;
        categoryBudget.totalBudget = catTotal; 
        categoryBudget.remainingAmount = catTotal - categoryBudget.spentAmount;
        await categoryBudget.save();
      }

      const overallTotal = Number(totalBudgetDoc.totalBudget || totalBudgetDoc.limit || 0);
      totalBudgetDoc.spentAmount = (Number(totalBudgetDoc.spentAmount) || 0) + expenseAmount;
      totalBudgetDoc.totalBudget = overallTotal;
      totalBudgetDoc.remainingAmount = overallTotal - totalBudgetDoc.spentAmount;
      await totalBudgetDoc.save();
      
      // Milestone Check (Alerts)
      const totalSpentAfter = totalBudgetDoc.spentAmount;
      const usagePercent = totalBudget > 0 ? (totalSpentAfter / totalBudget) * 100 : 0;

      let alertMsg = "";
      let threshold = 0;

      if (usagePercent >= 100) { alertMsg = `Your overall budget limit for ${expenseMonth} has been reached.`; threshold = 100; }
      else if (usagePercent >= 90) { alertMsg = `Warning: You have used 90% of your overall budget for ${expenseMonth}.`; threshold = 90; }
      else if (usagePercent >= 50 && usagePercent < 90) { alertMsg = `You have used 50% of your overall budget for ${expenseMonth}.`; threshold = 50; }

      if (alertMsg) {
        const existingAlert = await Alert.findOne({ userId, type: "milestone", threshold, month: expenseMonth });
        if (!existingAlert) {
          const newAlert = new Alert({ userId, type: "milestone", threshold, message: alertMsg, category: 'total', month: expenseMonth });
          await newAlert.save();
          if (user.email) await sendEmail(user.email, "Budget Alert", alertMsg + ` Total Spent: ₹${totalSpentAfter} / ₹${totalBudget}`);
        }
      }
    }

    // 5. Save Expense
    const expense = new Expense({
      userId,
      category,
      amount: expenseAmount,
      description,
      date: expenseDate,
      paymentMethod: "Online",
      isRecurring: false,
      autoGenerated: true,
      source: source || "demo-payment-app",
      messageHash,
    });

    const savedExpense = await expense.save();
    res.json(savedExpense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Auto Detect SMS (Copy-Paste)
exports.autoDetectSms = async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!message) return res.status(400).json({ message: "No message provided" });

    // Robust extraction: prioritize amounts near currency symbols or transaction keywords
    let amount = 0;
    
    // Pattern 1: Currency symbols (e.g., Rs. 500, Rs500, ₹ 500, INR 500)
    const currencyMatch = message.match(/(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d+)?)/i);
    // Pattern 2: Transaction keywords (e.g., debited by 500, spent 500, amount 500)
    const keywordMatch = message.match(/(?:debited|credited|spent|paid|received|amount|by|of|for)\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:\.\d+)?)/i);
    // Pattern 3: Fallback - first number that isn't connected to 'A/C' or 'X' (common account prefixes)
    const fallbackMatch = message.match(/(?<![A-Z0-9])(\d+(?:\.\d+)?)(?![A-Z0-9])/);

    if (currencyMatch) {
      amount = Number(currencyMatch[1]);
    } else if (keywordMatch) {
      amount = Number(keywordMatch[1]);
    } else if (fallbackMatch) {
      amount = Number(fallbackMatch[0]);
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Could not detect a valid transaction amount in SMS" });
    }

    const msgLower = message.toLowerCase();

    // Detect type
    let type = "expense"; // debit
    if (msgLower.includes("credited") || msgLower.includes("received") || msgLower.includes("salary")) {
      type = "income";
    } else if (msgLower.includes("debited") || msgLower.includes("spent") || msgLower.includes("paid")) {
      type = "expense";
    }

    // Detect Category & Description
    let category = "other";
    let description = "Detected from SMS";

    if (type === "expense") {
      const categoryKeywords = {
        food: ["swiggy", "zomato", "mcdonalds", "kfc", "dominos", "food", "restaurant"],
        travel: ["uber", "ola", "rapido", "irctc", "makemytrip", "flight", "train", "auto"],
        shopping: ["amazon", "flipkart", "myntra", "meesho", "shopping", "store", "mall"],
        bills: ["electricity", "recharge", "jio", "airtel", "water", "bill", "broadband"]
      };

      for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => msgLower.includes(kw))) {
          category = cat;
          break;
        }
      }

      const words = msgLower.split(/\W+/);
      const possibleMerchants = ["swiggy", "zomato", "amazon", "flipkart", "uber", "ola", "jio", "airtel"];
      const foundMerchant = words.find(w => possibleMerchants.includes(w));
      if (foundMerchant) {
        description = foundMerchant.charAt(0).toUpperCase() + foundMerchant.slice(1);
      }
    } else {
       category = "income";
       if (msgLower.includes("salary")) {
          category = "salary";
          description = "Salary";
       } else {
          description = "Credit Received";
       }
    }

    // Generate message hash for exact duplicate detection (same message pasted)
    const messageHash = crypto.createHash('md5').update(message.trim()).digest('hex');

    // Extract Reference Number (Ref No, Txn ID, UTR) - Excluding IPPB No (Account)
    let referenceId = null;
    const refMatch = message.match(/(?:ref\s*no\.?|txn\s*id|utr|reference|id:)\s*[:#-]?\s*([a-z0-9]+)/i);
    if (refMatch) {
      referenceId = refMatch[1];
    }

    // Duplicate Prevention
    let duplicate = null;
    if (referenceId) {
      // Check for same Transaction ID
      duplicate = await Expense.findOne({ userId, referenceId });
    } else {
      // Check for exact same message (same text pasted)
      duplicate = await Expense.findOne({ userId, messageHash });
    }
    
    if (duplicate) {
      return res.status(400).json({ message: "Duplicate SMS transaction prevented" });
    }

    const expenseDate = new Date();
    const expenseMonth = expenseDate.toISOString().slice(0, 7);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure user has some default wallet baseline, otherwise it blocks all expenses
    // In fintech simulations, we might just allow 0 wallet to go negative, or set start balance.
    // However, user specifically asked: If expense exceeds wallet balance -> prevent.
    if (user.totalSavings == null || user.totalSavings === undefined) {
      user.totalSavings = 0;
    }

    if (type === "expense") {
      const budgets = await Budget.find({ userId, month: expenseMonth });
      const totalBudgetDoc = budgets.find(b => b.category === 'total');
      const categoryBudget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());

      // We decouple SMS tracking from the "Total Savings" (Wallet) logic as per user request
      // This prevents the wallet from going negative due to bank expenses already handled by the bank
      if (totalBudgetDoc) {
        if (Number(totalBudgetDoc.spentAmount) + amount > Number(totalBudgetDoc.limit || totalBudgetDoc.totalBudget)) {
          return res.status(400).json({ message: "Transaction failed: Overall Budget limit exceeded." });
        }
      }

      // Skip wallet update for SMS sources
      // user.totalSavings = (user.totalSavings || 0) - amount; // REMOVED
      // await user.save();

      if (totalBudgetDoc) {
        totalBudgetDoc.spentAmount += amount;
        const totalL = Number(totalBudgetDoc.limit || totalBudgetDoc.totalBudget);
        totalBudgetDoc.remainingAmount = totalL - totalBudgetDoc.spentAmount;
        totalBudgetDoc.totalBudget = totalL; // ensure fallback
        await totalBudgetDoc.save();
      }

      if (categoryBudget) {
        categoryBudget.spentAmount += amount;
        const catL = Number(categoryBudget.limit || categoryBudget.totalBudget);
        categoryBudget.remainingAmount = catL - categoryBudget.spentAmount;
        categoryBudget.totalBudget = catL;
        await categoryBudget.save();
      }

    } else {
      // For income SMS, we add the amount to the bank balance (totalSavings) as requested
      user.totalSavings = (user.totalSavings || 0) + amount;
      await user.save();
    }

    const expense = new Expense({
      userId,
      type,
      category,
      amount,
      description,
      date: expenseDate,
      paymentMethod: "SMS",
      isRecurring: false,
      autoGenerated: true,
      source: "sms",
      referenceId,
      messageHash
    });

    const savedExpense = await expense.save();
    res.json(savedExpense);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};