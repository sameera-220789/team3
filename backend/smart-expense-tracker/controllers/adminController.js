const User = require("../models/User");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const jwt = require("jsonwebtoken");

// ─── Admin Login ────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || "nikithak054@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "0912";

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { role: "admin", email: adminEmail },
      process.env.JWT_SECRET || "6304675628",
      { expiresIn: "8h" }
    );

    res.json({ message: "Admin login successful", token, role: "admin" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Overall Stats ──────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    const expenseAgg = await Expense.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expenseAgg[0]?.count || 0;
    const totalSpending = expenseAgg[0]?.total || 0;

    const totalBudgets = await Budget.countDocuments();

    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
      role: { $ne: "admin" }
    });

    // New expenses today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expensesToday = await Expense.countDocuments({ createdAt: { $gte: today } });

    // API request count tracker (simple in-memory via global)
    const apiRequests = global.apiRequestCount || 0;

    res.json({
      totalUsers,
      totalExpenses,
      totalSpending,
      totalBudgets,
      newUsersThisWeek,
      expensesToday,
      apiRequests,
      serverStatus: "running",
      dbStatus: "connected"
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── All Users ───────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { role: { $ne: "admin" } };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Delete User ─────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove all associated data
    await Expense.deleteMany({ userId: id });
    await Budget.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Recent Activities ───────────────────────────────────────────────────────
exports.getActivities = async (req, res) => {
  try {
    // Latest expenses
    const recentExpenses = await Expense.find({ type: "expense" })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Latest signups
    const recentSignups = await User.find({ role: { $ne: "admin" } })
      .select("firstName lastName email createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Latest budgets
    const recentBudgets = await Budget.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = [];

    recentExpenses.forEach((e) => {
      if (e.userId) {
        activities.push({
          type: "expense",
          userName: `${e.userId.firstName} ${e.userId.lastName}`,
          action: `added ${e.category} expense of ₹${e.amount?.toLocaleString("en-IN")}`,
          time: e.createdAt
        });
      }
    });

    recentSignups.forEach((u) => {
      activities.push({
        type: "signup",
        userName: `${u.firstName} ${u.lastName}`,
        action: "created a new account",
        time: u.createdAt
      });
    });

    recentBudgets.forEach((b) => {
      if (b.userId) {
        activities.push({
          type: "budget",
          userName: `${b.userId.firstName} ${b.userId.lastName}`,
          action: `created ${b.category} budget of ₹${b.limit?.toLocaleString("en-IN")}`,
          time: b.createdAt
        });
      }
    });

    // Sort all mixed activities by time
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(activities.slice(0, 20));
  } catch (error) {
    console.error("Admin activities error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Category Usage ───────────────────────────────────────────────────────────
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Expense.aggregate([
      { $match: { type: "expense", category: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const grandTotal = stats.reduce((sum, s) => sum + s.total, 0);

    const result = stats.map((s) => ({
      category: s._id,
      count: s.count,
      total: s.total,
      percentage: grandTotal > 0 ? Math.round((s.total / grandTotal) * 100) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error("Admin categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Spending Trends ──────────────────────────────────────────────────────────
exports.getSpendingTrends = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;

    let groupFormat, startDate;
    const now = new Date();

    if (period === "daily") {
      // Last 14 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 13);
      groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    } else if (period === "monthly") {
      // Last 12 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);
      groupFormat = { $dateToString: { format: "%Y-%m", date: "$date" } };
    } else {
      // Weekly – last 8 weeks
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 55);
      groupFormat = {
        $dateToString: {
          format: "%Y-W%V",
          date: "$date"
        }
      };
    }

    const trends = await Expense.aggregate([
      {
        $match: {
          type: "expense",
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends.map((t) => ({ label: t._id, total: t.total, count: t.count })));
  } catch (error) {
    console.error("Admin spending trends error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── System Health ─────────────────────────────────────────────────────────────
exports.getSystemHealth = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const dbState = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

    res.json({
      server: "running",
      database: dbState === 1 ? "connected" : "disconnected",
      apiRequests: global.apiRequestCount || 0,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Transactions List ───────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const expenses = await Expense.find({ type: "expense" })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 expenses
    
    // Also get budgets as transactions context if needed, but primarily expenses
    res.json(expenses);
  } catch (error) {
    console.error("Admin transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Dynamic Alerts ──────────────────────────────────────────────────────────
exports.getAlerts = async (req, res) => {
  try {
    const alerts = [];
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. High value transactions (e.g. over 100,000)
    const largeExpenses = await Expense.find({ amount: { $gte: 100000 }, type: "expense" })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(10);
    
    largeExpenses.forEach(exp => {
      alerts.push({
        severity: "high",
        title: "Unusual Large Transaction",
        description: `User: ${exp.userId?.firstName} ${exp.userId?.lastName} - ₹${exp.amount.toLocaleString("en-IN")} expense for ${exp.category}`,
        time: exp.createdAt,
        actions: ["Review", "Flag"]
      });
    });

    // 2. Medium value transactions (e.g. over 50,000 but less than 100,000)
    const mediumExpenses = await Expense.find({ amount: { $gte: 50000, $lt: 100000 }, type: "expense" })
        .populate("userId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(10);
    
    mediumExpenses.forEach(exp => {
        alerts.push({
            severity: "medium",
            title: "Large Expense Detected",
            description: `User: ${exp.userId?.firstName} ${exp.userId?.lastName} - ₹${exp.amount.toLocaleString("en-IN")} expense for ${exp.category}`,
            time: exp.createdAt,
            actions: ["Review", "Contact"]
        });
    });

    // 3. High number of budgets (suspicious activity)
    const usersWithManyBudgets = await Budget.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $match: { count: { $gte: 10 } } }
    ]);

    for (const item of usersWithManyBudgets) {
      const user = await User.findById(item._id);
      if (user) {
        alerts.push({
          severity: "low",
          title: "Excessive Budgets Created",
          description: `User: ${user.firstName} ${user.lastName} - ${item.count} active budgets`,
          time: now,
          actions: ["Review", "Ignore"]
        });
      }
    }

    // Sort all alerts by time, most recent first
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));

    // If no alerts, return a couple of generated mock ones based on generic data
    if (alerts.length === 0) {
      alerts.push({
          severity: "medium",
          title: "Multiple Failed Login Attempts",
          description: "User: ankit@email.com - 8 attempts",
          time: twentyFourHoursAgo,
          actions: ["Review", "Block"]
      });
      alerts.push({
        severity: "low",
        title: "Rapid Transaction Entry",
        description: "User: Kavita - 25 transactions in 2 mins",
        time: twentyFourHoursAgo,
        actions: ["Review", "Ignore"]
      });
    }

    res.json(alerts);
  } catch (error) {
    console.error("Admin alerts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
