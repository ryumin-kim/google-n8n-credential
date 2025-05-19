// server.js or index.js (entry point for Render server)
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const { getGoogleOAuthTokens } = require('./google-n8n-credential');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google Profile:', profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Step 1: Trigger OAuth
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Step 2: Callback and pass result to front
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
  const code = req.query.code;
  try {
    const tokens = await getGoogleOAuthTokens(code);
    console.log('✅ Tokens received:', tokens);
    res.send(`
      <script>
        window.opener.postMessage('google-login-success', 'https://supersimpleseo.net');
        window.close();
      </script>
    `);
  } catch (err) {
    console.error('❌ Token fetch failed:', err);
    res.status(500).json({ error: 'Token fetch failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OAuth Server running on port ${PORT}`);
});
