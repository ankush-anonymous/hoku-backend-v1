const { google } = require("googleapis");
const googleTokenRepository = require("../repositories/googleAuthRepository");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const googleAuth = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const flow = req.query.flow || "login";

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: flow,
  });

  res.redirect(authorizationUrl);
};

const googleAuthCallback = async (req, res) => {
  const code = req.query.code;
  const flow = req.query.state || "login";

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfoResponse = await oauth2.userinfo.get();

    // Define all variables from the Google response
    const email = userInfoResponse.data.email;
    const name = userInfoResponse.data.name; // <-- ADD THIS LINE
    const picture = userInfoResponse.data.picture; // <-- AND ADD THIS LINE

    const tokenData = {
      user_email: email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: new Date(tokens.expiry_date),
    };

    const existing = await googleTokenRepository.getTokenByEmail(email);
    if (existing) {
      await googleTokenRepository.updateToken(tokenData);
    } else {
      await googleTokenRepository.saveToken(tokenData);
    }

    // Now the redirect will work because 'name' and 'picture' are defined
    if (flow === "signup") {
      // 👇 Use the 'FRONTEND_URL' constant here
      res.redirect(
        `${FRONTEND_URL}/onboarding?email=${encodeURIComponent(
          email
        )}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(
          picture
        )}&flow=${flow}`
      );
    } else {
      // 👇 And use the 'FRONTEND_URL' constant here
      res.redirect(
    `${FRONTEND_URL}/dashboard?email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(
      picture
    )}`
  );
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send("Authentication failed.");
  }
};
module.exports = {
  googleAuth,
  googleAuthCallback,
};
