const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function testChatbot() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");

  const user = await User.findOne();
  if (!user) {
    console.log("No users found in database to test with.");
    process.exit(0);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '6304675628');
  console.log("Generated token for user:", user.email);

  const testMessage = "How much did I spend on food this month, and can I afford a laptop ?";

  console.log("Sending query:", testMessage);

  try {
    const response = await fetch("http://localhost:5000/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ message: testMessage })
    });

    const data = await response.json();
    console.log("\n--- CHATBOT RESPONSE ---");
    console.log(data);
    console.log("------------------------\n");
  } catch (err) {
    console.error("Test failed:", err);
  }
  
  process.exit(0);
}

testChatbot();
