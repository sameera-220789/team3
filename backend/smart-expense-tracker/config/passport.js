const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// ─── Google Strategy ───────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null;

        if (!email) {
          return done(new Error("No email returned from Google"), null);
        }

        // Check if user already exists (by email)
        let user = await User.findOne({ email });

        if (user) {
          // Existing user — update provider info if they used local before
          if (user.provider === "local") {
            user.provider = "google";
            user.providerId = profile.id;
            user.picture = profile.photos?.[0]?.value || null;
            await user.save();
          }
          return done(null, user);
        }

        // New user — create account
        const nameParts = (profile.displayName || "Google User").split(" ");
        const firstName = nameParts[0] || "Google";
        const lastName = nameParts.slice(1).join(" ") || "User";

        user = new User({
          firstName,
          lastName,
          email,
          password: null,
          currency: "INR",
          provider: "google",
          providerId: profile.id,
          picture: profile.photos?.[0]?.value || null,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// ─── GitHub Strategy ───────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may return multiple emails; pick the primary one
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

        // Check if user already exists (by email)
        let user = await User.findOne({ email });

        if (user) {
          if (user.provider === "local") {
            user.provider = "github";
            user.providerId = String(profile.id);
            user.picture = profile.photos?.[0]?.value || null;
            await user.save();
          }
          return done(null, user);
        }

        // New user — create account
        const displayName = profile.displayName || profile.username || "GitHub User";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "GitHub";
        const lastName = nameParts.slice(1).join(" ") || "User";

        user = new User({
          firstName,
          lastName,
          email,
          password: null,
          currency: "INR",
          provider: "github",
          providerId: String(profile.id),
          picture: profile.photos?.[0]?.value || null,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        console.error("GitHub OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize / deserialize for session (minimal usage — we use JWT)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
