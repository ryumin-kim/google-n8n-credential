const express = require('express');
const fetch = require('node-fetch');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.use(express.json());

// 구글 OAuth2 인증을 위한 URL 생성
app.get('/google/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
  });
  res.redirect(url);
});

// 구글 인증 후 받은 코드를 이용해 액세스 토큰 받기
app.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 여기서 크레덴셜 생성하는 API 호출 또는 n8n으로 전송하는 작업을 진행
    // 예시로 n8n API에 크레덴셜 데이터를 보내는 작업
    const n8nUrl = 'https://your-n8n-instance.com';  // n8n URL 입력
    const apiKey = 'YOUR_N8N_API_KEY';  // n8n API 키 입력

    const response = await fetch(`${n8nUrl}/api/v1/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify({
        name: 'Google OAuth2 Credential',
        type: 'OAuth2',
        nodesAccess: [],
        data: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/drive.readonly'],
        },
      }),
    });

    const data = await response.json();
    res.json({ message: 'Credential created successfully', data });
  } catch (error) {
    res.status(500).json({ error: 'Error during Google OAuth2 authentication', details: error.message });
  }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
