const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const session = require('express-session');  // 세션 사용을 위한 모듈 추가
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 세션 설정 (세션을 저장할 수 있도록 세션 미들웨어 추가)
app.use(session({
  secret: 'your-secret-key',   // 세션 암호화용 키
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());  // 세션을 사용하도록 추가

// Passport가 사용자 정보를 세션에 저장할 수 있도록 설정
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

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
      console.log(profile); // 로그인 정보 확인
      return done(null, profile);
    }
  )
);

// 구글 로그인 라우트
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],  // 이메일과 프로필 정보 요청
  })
);

// 구글 로그인 후 콜백 처리
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // 로그인 성공 후 처리
    // 로그인한 사용자를 세션에 저장하고 다른 페이지로 리디렉션
    console.log('User logged in: ', req.user);
    res.redirect('/dashboard');  // 로그인 성공 후 대시보드로 리디렉션
  }
);

// 로그인 상태 확인 라우트 (예시)
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'User is logged in', user: req.user });
  } else {
    res.json({ message: 'No user logged in' });
  }
});

// 대시보드 예시 페이지 (로그인 후 리디렉션되는 페이지)
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Welcome ${req.user.displayName}</h1><p>Your email: ${req.user.emails[0].value}</p>`);
  } else {
    res.redirect('/');  // 로그인하지 않으면 홈으로 리디렉션
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
