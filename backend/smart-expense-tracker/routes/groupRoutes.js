const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const { verifyGroupAccess } = require("../middleware/groupAuth");

// Create a new group
router.post("/create", groupController.createGroup);

// Join group via password
router.post("/join", groupController.joinGroup);

// Get groups for a user
router.get("/", groupController.getGroups);

// Add a split expense
router.post("/expense/add", groupController.addSplitExpense);
router.put("/expense/:id", groupController.editSplitExpense);
router.delete("/expense/:id", groupController.deleteSplitExpense);

// Get expenses for a specific group
router.get("/:id/expenses", groupController.getGroupExpenses);

// Get balance summary for a specific group
router.get("/:id/balance", groupController.getGroupBalance);

// Chat Routes
router.post("/:id/chat", verifyGroupAccess, groupController.sendChatMessage);
router.get("/:id/chat", verifyGroupAccess, groupController.getChatMessages);

// Get basic Group details by DB _id
router.get("/:id", verifyGroupAccess, async (req, res) => {
  try {
    const Group = require("../models/Group");
    const group = await Group.findById(req.params.id).select("-groupPassword");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch(e) {
    res.status(500).json({ message: "Error fetching group" });
  }
});

module.exports = router;
