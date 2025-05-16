const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(passport.initialize());

// Google OAuth2 Strategy 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://google-n8n-credential.onrender.com/auth/google/callback",  // Render의 콜백 URL
    },
    (accessToken, refreshToken, profile, done) => {
      // 로그인한 사용자 정보 저장 (예: DB에 저장)
      console.log(profile);
      return done(null, profile);
    }
  )
);

// 구글 로그인 라우트
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// 구글 로그인 후 콜백
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // 로그인 성공 후 처리
    res.json({ message: 'Google login successful', user: req.user });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
