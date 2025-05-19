const { google } = require('googleapis');

// Google OAuth2 클라이언트 설정
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// code → token 발급
const getGoogleOAuthTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (err) {
    console.error('❌ Error getting Google OAuth tokens:', err);
    throw err;
  }
};

module.exports = { getGoogleOAuthTokens };
