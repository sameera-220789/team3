const jwt = require("jsonwebtoken");

/**
 * Called after Passport successfully authenticates via Google or GitHub.
 * Generates a JWT and redirects the browser to the frontend callback page.
 */
exports.handleOAuthCallback = (req, res) => {
  try {
    const user = req.user; // populated by Passport

    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=oauth_failed`
      );
    }

    // Generate JWT (same structure as the existing login route)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "6304675628",
      { expiresIn: "1h" }
    );

    // Build user payload for localStorage (mirrors existing login response)
    const userPayload = JSON.stringify({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency,
      picture: user.picture || null,
    });

    // Redirect frontend to the /oauth/callback page, passing token & user
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/oauth/callback?token=${encodeURIComponent(
      token
    )}&user=${encodeURIComponent(userPayload)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
