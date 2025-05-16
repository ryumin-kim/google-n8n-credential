const { google } = require('googleapis');
const fetch = require('node-fetch');

// Google OAuth2 클라이언트 설정
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://your-redirect-url.com/auth/google/callback' // 리디렉션 URL
);

const generateCredentialForN8n = async (token) => {
  const response = await fetch('https://n8n-instance-url.com/api/v1/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': process.env.N8N_API_KEY,
    },
    body: JSON.stringify({
      name: 'Google OAuth Credential',
      type: 'google',
      nodesAccess: [],
      data: { 
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        scope: token.scope,
        tokenType: token.token_type
      }
    })
  });

  return response.json();
};

// 구글 로그인 후 callback
const getGoogleOAuthTokens = (code) => {
  return oauth2Client.getToken(code)
    .then(tokens => {
      return generateCredentialForN8n(tokens);
    })
    .catch(error => {
      console.error('Error in token generation:', error);
    });
};

module.exports = { getGoogleOAuthTokens };
