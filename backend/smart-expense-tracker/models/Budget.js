// const express = require("express");
// const router = express.Router();
// const Budget = require("../models/Budget");

// // SET BUDGET
// router.post("/set", async (req, res) => {

//   try {

//     const { userId, category, limit } = req.body;

//     const budget = new Budget({
//       userId,
//       category,
//       limit
//     });

//     await budget.save();

//     res.json({
//       message: "Budget saved successfully",
//       budget
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }

// });

// // GET BUDGET
// router.get("/", async (req, res) => {

//   try {

//     const budgets = await Budget.find();

//     res.json(budgets);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }

// });

// module.exports = router;



const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Budget", budgetSchema);