const express = require("express");
const router = express.Router();
const { addIncome } = require("../controllers/incomeController");

// ADD income manually
router.post("/add", addIncome);

module.exports = router;
