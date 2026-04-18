import express from "express";
import passport from "passport";

const authRoutes = express.Router();

// Start Google login
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback - Check onboarding status and send to frontend
authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  (req, res) => {
    if (req.isAuthenticated()) {
      // 🔥 Check if onboarding is completed
      const onboardingCompleted = req.user.onboarding?.isCompleted || false;
      const currentStep = req.user.onboarding?.currentStep || 1;

      return res.send(`
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage(
              {
                type: "GOOGLE_AUTH_SUCCESS",
                success: true,
                onboardingCompleted: ${onboardingCompleted},
                currentStep: ${currentStep},
                user: ${JSON.stringify({
                  _id: req.user._id,
                  name: req.user.name,
                  email: req.user.email,
                  avatar: req.user.avatar
                })}
              },
              "*"
            );
            window.close();
          </script>
          <p>Login successful! Closing window...</p>
        </body>
        </html>
      `);
    } else {
      return res.send(`
        <script>
          window.opener.postMessage(
            { type: "GOOGLE_AUTH_SUCCESS", success: false, error: "Authentication failed" },
            "*"
          );
          window.close();
        </script>
      `);
    }
  }
);

// Check auth status (keep existing)
authRoutes.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      loggedIn: true,
      user: req.user,
    });
  } else {
    return res.json({
      loggedIn: false,
    });
  }
});

// Logout (keep existing)
authRoutes.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out" });
    });
  });
});

export default authRoutes;