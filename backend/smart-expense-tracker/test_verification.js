const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB");
};

const Budget = require("./models/Budget");
const Alert = require("./models/Alert");
const User = require("./models/User");

const testThresholds = async () => {
    await connectDB();
    const user = await User.findOne();
    if (!user) return console.log("No user found");
    
    console.log("Testing thresholds for user:", user._id);
    const expenseMonth = new Date().toISOString().slice(0, 7);

    // Clear old data for test
    await Budget.deleteMany({ userId: user._id, month: expenseMonth });
    await Alert.deleteMany({ userId: user._id, month: expenseMonth });

    // 1. Create a total budget of 1000
    const totalBudgetDoc = new Budget({
        userId: user._id, category: "total", limit: 1000, 
        totalBudget: 1000, spentAmount: 0, 
        remainingAmount: 1000, month: expenseMonth
    });
    await totalBudgetDoc.save();
    
    console.log("Created budget of 1000");

    // 2. Simulate expenseController logic: Assume an expense of 950 comes in.
    const expenseAmount = 950;
    const totalBudget = 1000;
    
    totalBudgetDoc.spentAmount = expenseAmount;
    totalBudgetDoc.remainingAmount = totalBudget - expenseAmount;
    await totalBudgetDoc.save();

    const totalSpentAfter = totalBudgetDoc.spentAmount;
    const usagePercent = totalBudget > 0 ? (totalSpentAfter / totalBudget) * 100 : 0;
    
    console.log("Usage percent:", usagePercent);

    const thresholds = [
        { level: 50, msg: `You have used 50% of your overall budget for ${expenseMonth}.` },
        { level: 90, msg: `Warning: You have used 90% of your overall budget for ${expenseMonth}.` },
        { level: 100, msg: `Your overall budget limit for ${expenseMonth} has been reached.` }
    ];

    for (const t of thresholds) {
        if (usagePercent >= t.level) {
            const existingAlert = await Alert.findOne({ userId: user._id, type: "milestone", threshold: t.level, month: expenseMonth });
            if (!existingAlert) {
                const newAlert = new Alert({
                    userId: user._id,
                    type: "milestone",
                    threshold: t.level,
                    message: t.msg,
                    category: 'total',
                    month: expenseMonth
                });
                await newAlert.save();
                console.log(`Generated Alert for threshold: ${t.level}%`);
            }
        }
    }

    const finalAlerts = await Alert.find({ userId: user._id, month: expenseMonth });
    console.log("Final saved alerts:");
    console.log(finalAlerts);
    process.exit(0);
};

testThresholds();
