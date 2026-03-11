// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const { signup } = require("../controllers/authController");

// // SIGNUP
// router.post("/signup", async(req,res)=>{

//   const {name,email,password} = req.body;

//   const user = new User({
//     name,
//     email,
//     password
//   });

//   await user.save();

//   res.json({
//     message:"User registered successfully"
//   });

// });


// // LOGIN
// router.post("/login", async(req,res)=>{

//   const {email,password} = req.body;

//   const user = await User.findOne({email,password});

//   if(user){
//     res.json({
//       message:"Login successful"
//     });
//   }else{
//     res.status(401).json({
//       message:"Invalid credentials"
//     });
//   }

// });

// module.exports = router;
const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

// SIGNUP (Controller use chestham)
router.post("/signup", signup);

// LOGIN
router.post("/login", login);

module.exports = router;