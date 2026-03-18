const express = require("express");
const router = express.Router();
const passport = require("passport");
const { handleOAuthCallback } = require("../controllers/oauthController");

// ─── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  handleOAuthCallback
);

// ─── GitHub OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to GitHub auth page
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Step 2: GitHub redirects here after user approves
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login", session: false }),
  handleOAuthCallback
);

module.exports = router;
