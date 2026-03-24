const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Expense = require("./models/Expense");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const expense = await Expense.findOne();
    if (expense) {
        console.log("EXPENSE_USER_ID:" + expense.userId);
        console.log("EXPENSE_DATE:" + expense.date);
    } else {
        console.log("NO_EXPENSE");
    }
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
