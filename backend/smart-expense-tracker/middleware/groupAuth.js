const jwt = require("jsonwebtoken");

const verifyGroupAccess = (req, res, next) => {
  // Check for standard user token first
  const authHeader = req.header("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET || "smart_expense_session_secret");
      req.user = verified;
      return next();
    } catch (err) {
      // Ignore user token error and fall through to guest token
    }
  }

  // Check for guest token specifically mapping to this groupId
  const guestHeader = req.header("x-guest-token");
  if (guestHeader) {
    try {
      const verified = jwt.verify(guestHeader, process.env.JWT_SECRET || process.env.SESSION_SECRET || "smart_expense_session_secret");
      
      const requestedGroupId = req.params.id || req.body.groupId;
      
      if (verified.role === 'guest' && verified.allowedGroup === requestedGroupId) {
        req.guest = verified;
        return next();
      }
    } catch (err) {
      return res.status(401).json({ message: "Invalid guest token" });
    }
  }

  res.status(401).json({ message: "Access denied. Valid user token or guest token required." });
};

module.exports = { verifyGroupAccess };
