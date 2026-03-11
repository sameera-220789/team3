// const { sendEmail } = require("../backend/server");
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");

// exports.signup = async (req, res) => {
//   const { name, email, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const user = new User({
//     name,
//     email,
//     password: hashedPassword
//   });

//   await user.save();

//   res.json({ message: "User registered successfully" });
// };



// const { sendEmail } = require("../backend/server");
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");



//   await user.save();
//   console.log("User saved successfully");

// Email send
//   await sendEmail(
//     email,
//     "Welcome to Smart Expense Tracker",
//     "Your account has been created successfully."
//   );
//   console.log("email function executed");
//   res.json({ message: "User registered successfully" });
// };

// exports.signup = async (req, res) => {
//   const { name, email, password } = req.body;

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const user = new User({
//     name,
//     email,
//     password: hashedPassword
//   });
const sendEmail = require("../config/email");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, currency } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      currency
    });

    // save user
    await user.save();

    console.log("User saved successfully");

    // send welcome email
    await sendEmail(
      email,
      "Welcome to Smart Expense Tracker",
      `Hi ${firstName},\n\nYour account has been created successfully. Welcome to Smart Expense Tracker!`
    );

    console.log("Email sent successfully");

    res.json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "6304675628", // Fallback to provided secret if env is missing
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currency: user.currency
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};