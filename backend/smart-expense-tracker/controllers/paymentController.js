const PaymentTransaction = require("../models/PaymentTransaction");

// Process Payment
exports.processPayment = async (req, res) => {
  try {
    const { userId, amount, receiver, category, note, phoneNumber, bankDetails } = req.body;

    if (!userId || !amount || !receiver) {
      return res.status(400).json({ message: "userId, amount, and receiver are required" });
    }

    const transaction = new PaymentTransaction({
      userId,
      amount,
      receiver,
      category,
      note,
      phoneNumber,
      bankDetails
    });

    const savedTransaction = await transaction.save();

    res.status(201).json({
      message: "Payment processed successfully",
      transaction: savedTransaction
    });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
