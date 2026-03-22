const mongoose = require('mongoose');
const Budget = require('./models/Budget');

mongoose.connect('mongodb://127.0.0.1:27017/smart-expense-tracker')
  .then(async () => {
     const budgets = await Budget.find({ userId: "64b0f2d9e61c770012345678" });
     console.log('Found budgets:', JSON.stringify(budgets, null, 2));
     process.exit(0);
  });
