const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB...");
    console.log("Database Name:", mongoose.connection.name);
    console.log("Collection Name:", User.collection.name);
    
    const count = await User.countDocuments({});
    console.log("Total Users in this collection:", count);
    
    // Fetch the last inserted user
    const lastUser = await User.findOne().sort({ createdAt: -1 });
    console.log("Last Registered User:", JSON.stringify(lastUser, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
