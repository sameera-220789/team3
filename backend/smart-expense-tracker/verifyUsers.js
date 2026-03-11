const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const users = await User.find({});
    console.log("=====================");
    console.log(`TOTAL USERS: ${users.length}`);
    console.log("=====================");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
