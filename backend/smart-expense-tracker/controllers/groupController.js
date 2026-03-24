const Group = require("../models/Group");
const SplitExpense = require("../models/SplitExpense");

// Create Group
exports.createGroup = async (req, res) => {
  try {
    const { groupName, members, createdBy } = req.body;
    
    if (!groupName || !members || members.length === 0) {
      return res.status(400).json({ message: "Group name and members are required" });
    }

    const group = new Group({
      groupName,
      members,
      createdBy
    });

    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating group", error });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const { userId, userName, userEmail } = req.query;

    const orConditions = [];
    if (userId) orConditions.push({ createdBy: userId });
    if (userName) orConditions.push({ members: userName });
    if (userEmail) orConditions.push({ members: userEmail });

    const filter = orConditions.length > 0 ? { $or: orConditions } : {};

    const groups = await Group.find(filter).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching groups", error });
  }
};

// Add Split Expense
exports.addSplitExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitBetween, date } = req.body;

    if (!groupId || !amount || !paidBy || !splitBetween || splitBetween.length === 0) {
      return res.status(400).json({ message: "Missing required fields for split expense" });
    }

    const expense = new SplitExpense({
      groupId,
      description,
      amount,
      paidBy,
      splitBetween,
      date: date || Date.now()
    });

    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding split expense", error });
  }
};

// Get Group Expenses
exports.getGroupExpenses = async (req, res) => {
  try {
    const expenses = await SplitExpense.find({ groupId: req.params.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching group expenses", error });
  }
};

// Edit Split Expense
exports.editSplitExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, paidBy, splitBetween } = req.body;
    
    const expense = await SplitExpense.findById(id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (paidBy) expense.paidBy = paidBy;
    if (splitBetween) expense.splitBetween = splitBetween;
    
    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating expense", error });
  }
};

// Delete Split Expense
exports.deleteSplitExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await SplitExpense.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

// Get Group Balance Summary
exports.getGroupBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await SplitExpense.find({ groupId: id });
    const group = await Group.findById(id);

    if (!group) return res.status(404).json({ message: "Group not found" });

    // 1. Calculate net balances for each member
    // positive balance == they are owed money (they paid more than their share)
    // negative balance == they owe money (they paid less than their share)
    const balances = {};
    group.members.forEach(member => {
      balances[member] = 0;
    });

    expenses.forEach(exp => {
      // The person who paid gets a positive credit for the full amount
      if (balances[exp.paidBy] !== undefined) {
          balances[exp.paidBy] += Number(exp.amount);
      } else {
          balances[exp.paidBy] = Number(exp.amount); // fallback just in case
      }

      // Everyone subtracts their share (debit)
      exp.splitBetween.forEach(split => {
         if (balances[split.member] !== undefined) {
             balances[split.member] -= Number(split.share);
         } else {
             balances[split.member] = -Number(split.share);
         }
      });
    });

    // 2. Simplify debts using a greedy algorithm
    const debtors = [];
    const creditors = [];

    // Separate into who owes (debtors) and who is owed (creditors)
    for (const [member, balance] of Object.entries(balances)) {
      if (balance < -0.01) debtors.push({ member, amount: Math.abs(balance) });
      else if (balance > 0.01) creditors.push({ member, amount: balance });
    }

    // Sort descending
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.amount, creditor.amount);
      const roundedAmount = Math.round(amount * 100) / 100;

      if (roundedAmount > 0) {
        transactions.push({
          from: debtor.member,
          to: creditor.member,
          amount: roundedAmount,
          message: `${debtor.member} owes ${creditor.member} ₹${roundedAmount}`
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    // Return the raw balances as well as the simplified human-readable debts
    res.json({ balances, transactions });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating balances", error });
  }
};
