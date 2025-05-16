const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const session = require('express-session');
const { getGoogleOAuthTokens } = require('./google-n8n-credential'); // 구글 인증 처리 모듈

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
  callbackURL: 'https://google-n8n-credential.onrender.com/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google Profile:', profile);
  done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// 구글 로그인 요청
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// 구글 로그인 후 콜백
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const code = req.query.code;
  getGoogleOAuthTokens(code)  // 인증 후 받은 코드로 토큰을 받아서 n8n 크레덴셜을 생성
    .then(response => {
      res.json({ message: 'Google login successful', data: response });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create n8n credentials', details: error });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
