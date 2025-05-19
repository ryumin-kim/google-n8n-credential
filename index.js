const express = require('express');
const session = require('express-session');
const passport = require('passport');
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
  passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => {
  return done(null, {
    profile,
    query: req.session.queryParams, // 전달받은 user_id, credential_type
  });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Step 1: Trigger Google OAuth, store user info in session
app.get('/auth/google', (req, res, next) => {
  const { user_id, credential_type } = req.query;

  if (!user_id || !credential_type) {
    return res.status(400).send('Missing user_id or credential_type');
  }

  // save query for callback
  req.session.queryParams = { user_id, credential_type };
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Step 2: Google OAuth callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
  const code = req.query.code;
  const { user_id, credential_type } = req.user.query;

  try {
    const result = await getGoogleOAuthTokens(code, user_id, credential_type);

    if (result.success) {
      return res.send(`
        <script>
          window.opener.postMessage('google-login-success', 'https://supersimpleseo.net');
          window.close();
        </script>
      `);
    } else {
      return res.status(500).json({ error: 'Token fetch failed', details: result.error });
    }
  } catch (err) {
    console.error('❌ OAuth Callback Error:', err);
    res.status(500).json({ error: 'OAuth Callback Failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OAuth server running on port ${PORT}`);
});
