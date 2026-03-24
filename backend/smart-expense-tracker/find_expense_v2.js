const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Expense = require("./models/Expense");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const expense = await Expense.findOne().lean();
    if (expense) {
        console.log("FULL_USER_ID_" + String(expense.userId) + "_END");
        console.log("FULL_DATE_" + String(expense.date) + "_END");
    } else {
        console.log("NO_EXPENSE_FOUND");
    }
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
