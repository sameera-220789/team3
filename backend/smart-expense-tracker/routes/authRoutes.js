const express = require("express");
const router = express.Router();
const passport = require("passport");

const { signup, login, getProfile, updateProfile } = require("../controllers/authController");
const { handleOAuthCallback } = require("../controllers/oauthController");

// ─── Existing Email/Password Routes (unchanged) ────────────────────────────────
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;