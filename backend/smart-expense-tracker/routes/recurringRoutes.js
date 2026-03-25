const express = require("express");
const router = express.Router();
const { addRecurringBill, getRecurringBills, markAsPaid, deleteRecurringBill } = require("../controllers/recurringBillController");

router.post("/", addRecurringBill);
router.get("/", getRecurringBills);
router.put("/:id/pay", markAsPaid);
router.delete("/:id", deleteRecurringBill);

module.exports = router;
