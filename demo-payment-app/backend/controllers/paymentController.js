const PaymentTransaction = require("../models/PaymentTransaction");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const mongoose = require("mongoose");

// Auto-detect category from receiver/note text
const detectCategory = (text) => {
  const t = (text || "").toLowerCase();
  const map = {
    Food:        ["swiggy", "zomato", "mcdonalds", "kfc", "dominos", "food", "restaurant", "cafe", "pizza", "burger"],
    Travel:      ["uber", "ola", "rapido", "irctc", "makemytrip", "flight", "train", "bus", "taxi"],
    Shopping:    ["amazon", "flipkart", "myntra", "meesho", "shopping", "store", "mall", "market"],
    Bills:       ["electricity", "recharge", "jio", "airtel", "water", "bill", "broadband", "gas", "rent"],
    Entertainment: ["netflix", "hotstar", "prime", "spotify", "movie", "theatre", "cinema", "game"],
    Healthcare:  ["pharmacy", "doctor", "hospital", "medicine", "clinic", "health"],
  };
  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some(kw => t.includes(kw))) return cat;
  }
  return "Other";
};

// Helper: Get a default user for demo purposes if not logged in
const getDefaultUserId = async () => {
  if (mongoose.connection && mongoose.connection.db) {
    const defaultUser = await mongoose.connection.db.collection("users").findOne({});
    if (defaultUser) {
      return defaultUser._id.toString();
    }
  }
  return new mongoose.Types.ObjectId().toString();
};

// POST /api/payments/pay
exports.processPayment = async (req, res) => {
  try {
    let userId = req.body.userId;
    let token = "";

    // 1. Extract and verify JWT token (optional for demo app)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded.userId || decoded._id;
      } catch {
        // Ignore and proceed as demo guest
      }
    }

    if (!userId || userId === "demo") {
      userId = await getDefaultUserId();
    }

    // 2. Validate payload
    const { amount, receiver, note, phoneNumber, bankDetails, paymentMode } = req.body;
    if (!amount || !receiver) {
      return res.status(400).json({ message: "amount and receiver are required" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 3. Auto-detect category
    const category = detectCategory(`${receiver} ${note}`);

    // 4. Save PaymentTransaction in MongoDB
    const transaction = new PaymentTransaction({
      userId,
      amount: numericAmount,
      receiver,
      category,
      note: note || "",
      phoneNumber: phoneNumber || "",
      bankDetails: bankDetails || "",
      paymentMode: paymentMode || "mobile",
      status: "success"
    });

    const savedTx = await transaction.save();

    // 5. Call Expense Tracker's /api/expenses/auto-add
    const expenseTrackerUrl = process.env.EXPENSE_TRACKER_URL || "http://localhost:5000";
    let expenseId = null;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const expenseRes = await axios.post(
        `${expenseTrackerUrl}/api/expenses/auto-add`,
        {
          userId,
          amount: numericAmount,
          description: receiver + (note ? ` - ${note}` : ""),
          category,
          source: "demo-payment-app"
        },
        {
          headers,
          timeout: 8000
        }
      );
      expenseId = expenseRes.data?._id || null;
    } catch (expErr) {
      console.warn("Auto-expense creation failed (non-critical):", expErr?.response?.data?.message || expErr.message);
    }

    // 6. Update transaction with expense ID reference
    if (expenseId) {
      savedTx.expenseId = expenseId;
      await savedTx.save();
    }

    res.status(201).json({
      message: "Payment successful",
      transaction: savedTx,
      category,
      expenseLinked: !!expenseId
    });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// GET /api/payments/history
exports.getHistory = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || decoded.userId || decoded._id;
      } catch {}
    }

    if (!userId) {
      userId = await getDefaultUserId();
    }

    const transactions = await PaymentTransaction.find({ userId: userId }).sort({ timestamp: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
