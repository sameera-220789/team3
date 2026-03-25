const PaymentTransaction = require("../models/PaymentTransaction");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// Forward transaction to Expense Tracker
const forwardToExpenseTracker = async (transaction) => {
  try {
    const expenseTrackerUrl = process.env.EXPENSE_TRACKER_URL || "http://localhost:5000";
    const jwtSecret = process.env.JWT_SECRET || "6304675628";

    // Generate a temporary token to authenticate with the main app
    const token = jwt.sign({ userId: transaction.userId }, jwtSecret, { expiresIn: "1h" });

    const response = await axios.post(`${expenseTrackerUrl}/api/expenses/auto-add`, {
      amount: transaction.amount,
      description: `Payment to ${transaction.receiver}${transaction.note ? ': ' + transaction.note : ''}`,
      category: transaction.category,
      userId: transaction.userId,
      source: "demo-payment-app"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ forwarded to expense tracker:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Forwarding Error:", error.response?.data || error.message);
    // We don't throw here to avoid failing the payment if the tracker is down
    return null;
  }
};

// Process Payment
exports.processPayment = async (req, res) => {
  try {
    const { userId, amount, receiver, category, note, phoneNumber, bankDetails } = req.body;

    if (!userId || !amount || !receiver) {
      return res.status(400).json({ message: "userId, amount, and receiver are required" });
    }

    // Auto-categorize if missing (simple fallback)
    let finalCategory = category || "Other";
    if (!category) {
       const desc = (receiver + " " + (note || "")).toLowerCase();
       if (desc.includes("swiggy") || desc.includes("zomato") || desc.includes("food")) finalCategory = "Food";
       else if (desc.includes("uber") || desc.includes("ola") || desc.includes("travel")) finalCategory = "Travel";
       else if (desc.includes("amazon") || desc.includes("flipkart") || desc.includes("shopping")) finalCategory = "Shopping";
       else if (desc.includes("bill") || desc.includes("recharge")) finalCategory = "Bills";
    }

    const transaction = new PaymentTransaction({
      userId,
      amount,
      receiver,
      category: finalCategory,
      note,
      phoneNumber,
      bankDetails
    });

    const savedTransaction = await transaction.save();

    // Forwarding logic (Async)
    forwardToExpenseTracker(savedTransaction);

    res.status(201).json({
      message: "Payment processed successfully",
      transaction: savedTransaction,
      category: finalCategory
    });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get History
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const transactions = await PaymentTransaction.find(filter).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
