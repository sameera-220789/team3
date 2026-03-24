const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Public – admin login
router.post("/login", adminController.adminLogin);

// All routes below require valid admin JWT
router.use(verifyToken);
router.use(requireAdmin);

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getUsers);
router.delete("/user/:id", adminController.deleteUser);
router.get("/activities", adminController.getActivities);
router.get("/categories", adminController.getCategoryStats);
router.get("/spending-trends", adminController.getSpendingTrends);
router.get("/system-health", adminController.getSystemHealth);

module.exports = router;
