const express = require("express");
const { handleChatMessage } = require("../controllers/chatbotController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to protect the route and extract req.user
router.post("/", verifyToken, handleChatMessage);

module.exports = router;
