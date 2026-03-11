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

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    // save user
    await user.save();

    console.log("User saved successfully");

    // send welcome email
    await sendEmail(
      email,
      "Welcome to Smart Expense Tracker",
      "Your account has been created successfully."
    );

    console.log("Email sent successfully");

    res.json({ message: "User registered successfully" });

  } catch (error) {
    console.log("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};